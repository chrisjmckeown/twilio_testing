# Variables
DOMAIN_SID=""
FALLBACK_URL=""
CALLBACK_URL=""
TWILIO_ACCOUNT_SID="AC20021ca01da35f9de41afe9fa0dd329"
TWILIO_AUTH_TOKEN=""

curl -X POST https://messaging.twilio.com/v1/LinkShortening/Domains/"$DOMAIN_SID"/Config \
--data-urlencode "FallbackUrl="$FALLBACK_URL"" \
--data-urlencode "CallbackUrl="$CALLBACK_URL"" \
--data-urlencode "ContinueOnFailure=true" \
--data-urlencode "DisableHttps=false" \
-u "$TWILIO_ACCOUNT_SID":"$TWILIO_AUTH_TOKEN"