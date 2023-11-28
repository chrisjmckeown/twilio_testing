# Variables
MESSAGING_SERVICE_SID=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""

curl -X GET https://messaging.twilio.com/v1/LinkShortening/MessagingService/"$MESSAGING_SERVICE_SID"/DomainConfig \
-u "$TWILIO_ACCOUNT_SID":"$TWILIO_AUTH_TOKEN"
