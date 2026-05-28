# Dynamic Bazar Delivery - Direct APK Distribution

Sir ne Play Store ki jagah direct delivery partners ko APK dene ka decision liya hai. Is flow me Play Console upload ki zarurat nahi hai.

## Latest APK

Use this file for partner phones:

```text
mobile/play-store/release/dynamic-bazar-delivery-v1.apk
```

## Install Steps For Delivery Partner Phone

1. APK file partner ke phone me WhatsApp, Google Drive, USB, ya internal sharing se bhejo.
2. Phone me APK open karo.
3. Agar Android warning aaye, then allow:
   - Settings
   - Install unknown apps
   - Allow from this source
4. Install complete hone ke baad app open karo.
5. Partner mobile number and password se login karo.
6. Notification permission allow karo.
7. Location permission allow karo while app is in use.
8. Camera permission allow karo jab proof photo capture karna ho.

## Admin Setup Before Giving APK

- Partner ka mobile number `DP MASTER` me hona chahiye.
- Partner ka password set hona chahiye.
- Partner status active hona chahiye.
- Orders me partner name/number assigned hona chahiye.
- GAS Web App latest deployed hona chahiye.

## Direct APK Testing Checklist

- App install hoti hai.
- App icon/logo correct dikh raha hai.
- Login works.
- Orders refresh from system.
- Planned delivery date select hoti hai.
- Order detail open hota hai.
- Call customer button safe flow trigger karta hai.
- Delivery OTP send/verify flow works.
- Delivery proof photo capture/upload works.
- Failed/RTO proof photo capture/upload works.
- COD summary and settlement works.
- Daily stock proof capture works.
- Push notification receive hoti hai.
- Notification tap exact order detail open karta hai.

## Notes

- APK ko public groups me share mat karo.
- Sirf authorized delivery partners ko APK do.
- Future updates ke liye new APK install karna padega.
- Direct APK distribution me automatic Play Store updates nahi milenge.
