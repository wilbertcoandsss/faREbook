var nodemailer = require('nodemailer')

var smtpTransport = nodemailer.createTransport({
    host: "stmp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "wilbert.coand@gmail.com",
        pass: "Wb24072003"
    }
})

var rand, mailOptions, host, link

exports.verification = function(req, res){
    console.log(req.protocol)
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)){
        if (req.query.id == rand){
            console.log("Masuk bang");
        }
    }
}
