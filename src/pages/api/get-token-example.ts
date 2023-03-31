import { getToken } from "next-auth/jwt"

export default async (req, res) => {
  // If you don't have NEXTAUTH_SECRET set, you will have to pass your secret as `secret` to `getToken`
  const token = await getToken({ req })
  if (token) {
    // Signed in
    console.log("JSON Web Token", JSON.stringify(token, null, 2))
    res.json(token)
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}