// import { execSync } from "child_process";
import { randomBytes } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import httpProxy from "http-proxy";
import forge from "node-forge";
// import os from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";

const pki = forge.pki;
const rsa = forge.pki.rsa;
const __dirname = dirname(fileURLToPath(import.meta.url));

function createCertificate({ subject, issuer, extensions, duration, key }) {
  const keypair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
  const cert = forge.pki.createCertificate();

  cert.publicKey = keypair.publicKey;
  cert.serialNumber = randomBytes(32).toString("hex");
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + duration);

  cert.setSubject(subject);
  cert.setIssuer(issuer);
  cert.setExtensions(extensions);

  cert.sign(key ?? keypair.privateKey, forge.md.sha256.create());

  return {
    key: keypair.privateKey,
    cert: cert,
  };
}

function createCertificateAuthority() {
  const attributes = [
    {
      name: "commonName",
      value: "acedeed",
    },
    {
      name: "countryName",
      value: "AU",
    },
    {
      name: "stateOrProvinceName",
      value: "New South Wales",
    },
    {
      name: "localityName",
      value: "Sydney",
    },
    {
      name: "organizationName",
      value: "ACEDEED PTY LTD",
    },
  ];

  // Required for CA certificates.
  const extensions = [
    {
      name: "basicConstraints",
      cA: true,
      critical: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      critical: true,
    },
  ];

  return createCertificate({
    subject: attributes,
    issuer: attributes,
    extensions: extensions,
    duration: 365,
  });
}

function createTlsCertificate({ authority, key }) {
  const attributes = [
    {
      name: "commonName",
      value: "localhost",
    },
  ];

  const extensions = [
    {
      name: "basicConstraints",
      cA: false,
      critical: true,
    },
    {
      name: "keyUsage",
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    {
      name: "extKeyUsage",
      serverAuth: true,
      clientAuth: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 2,
          value: "localhost",
        },
        {
          type: 7,
          ip: "192.168.8.211"
        }
      ],
    },
  ];

  return createCertificate({
    subject: attributes,
    issuer: authority.subject.attributes,
    extensions: extensions,
    duration: 365,
    key: key,
  });
}

function main() {
  if (
    !(existsSync(`${__dirname}/.dev_cert/cert.pem`) && existsSync(`${__dirname}/.dev_cert/key.pem`))
  ) {
    const authority = createCertificateAuthority();
    const certificate = createTlsCertificate({
      authority: authority.cert,
      key: authority.key,
    });

    try {
      mkdirSync(`${__dirname}/.dev_cert`);
    } catch {
      // do nothing
    }
    writeFileSync(`${__dirname}/.dev_cert/ca.cert.pem`, pki.certificateToPem(authority.cert));
    writeFileSync(`${__dirname}/.dev_cert/cert.pem`, pki.certificateToPem(certificate.cert));
    writeFileSync(`${__dirname}/.dev_cert/key.pem`, pki.privateKeyToPem(certificate.key));

    console.log("no development certificates were found, created at ./dev_cert\n");

    // switch (os.type()) {
    //   case "Darwin":
    //     execSync(
    //       "security add-trusted-cert -p ssl -r trustRoot -k '${os.homedir()}/Library/Keychains/login.keychain' ./.dev_cert/ca.cert.pem"
    //     );
    //     break;

    //   case "Windows_NT":
    //     execSync("certutil -addstore Root ./.dev_cert/ca.cert.pem");
    //     break;

    //   case "Linux":
    //     console.log(
    //     );
    // }
  }

  const x1 = httpProxy
    .createProxyServer({
      target: {
        host: "localhost",
        port: 3000,
      },
      ssl: {
        key: readFileSync(`${__dirname}/.dev_cert/key.pem`, "utf8"),
        cert: readFileSync(`${__dirname}/.dev_cert/cert.pem`, "utf8"),
      },
      ws: true,
    })

  x1.on("error", (err, req, res) => {
    console.error(`Proxy error - ${err.message}`);
    try {
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
      }
      res.end("Bad gateway");
    } catch {}
  });

  x1.listen(3001, "0.0.0.0");

  const x2 = httpProxy
    .createProxyServer({
      target: {
        host: "127.0.0.1",
        port: 8000,
      },
      ssl: {
        key: readFileSync(`${__dirname}/.dev_cert/key.pem`, "utf8"),
        cert: readFileSync(`${__dirname}/.dev_cert/cert.pem`, "utf8"),
      },
      ws: true,
    })

  x2.on("error", (err, req, res) => {
    console.error(`Proxy error - ${err.message}`);
    try {
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
      }
      res.end("Bad gateway");
    } catch {}
  });

  x2.listen(8001, "0.0.0.0");

  console.log("Listening on https://0.0.0.0:8001")
  console.log("Listening on https://0.0.0.0:3001")
}


main();