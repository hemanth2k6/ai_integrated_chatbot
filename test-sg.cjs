const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "YOUR_API_KEY");

async function check() {
  try {
    await sgMail.send({
      from: "kalapatihemanth2006@gmail.com",
      to: "kalapatihemanth2006@gmail.com",
      subject: "Test SendGrid",
      text: "Testing"
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.response ? err.response.body : err);
  }
}
check();
