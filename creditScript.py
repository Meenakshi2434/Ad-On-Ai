curl -X POST https://yoursite.vercel.app/api/admin/add-credits \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d '{"ip": "THEIR_IP_HERE", "credits": 20}'