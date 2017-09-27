<h1>2 Factor authentication</h1>

<p>Impementing Time-Based One-Time Password, authentication based on a random generated serial number, as described here: https://tools.ietf.org/html/rfc6238</p>

<p>2 factor auth is based on 2 components, 1º is what user knows like a password, 2º is something that user have, like a cellphone. This is just an example implementation, for example this could be a phonegap app that generates serial codes and stores them as a passcode. The user can then associate that serial to the user account, each time the user wants to access is account he/she need's to check the app and provide the OTP + password.
</p>

<h1>Instalation</h1>

```
npm install
grunt default
```

<h1>Testing</h1>

```
node server/bin.js
```
<p>Open your browser with http://localhost:8080/</p>

<h1>TODOS</h1>
<p>- change Math.random() to a true random Algorithm</p>
