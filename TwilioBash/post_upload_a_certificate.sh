
DOMAIN_SID=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
CERTIFICATE=""
PRIVATE_KEY=""

curl -X POST https://messaging.twilio.com/v1/LinkShortening/Domains/"$DOMAIN_SID"/Certificate \
--data-urlencode "TlsCert="$CERTIFICATE""$PRIVATE_KEY"" \
-u "$TWILIO_ACCOUNT_SID":"$TWILIO_AUTH_TOKEN"
