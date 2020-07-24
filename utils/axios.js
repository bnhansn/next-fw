import axios from 'axios'

const DEV = process.env.NODE_ENV === 'development'

const API_URL = DEV
  ? 'http://localhost:4000'
  : 'https://vercel.sandbox.fireworktv.com'

const prodToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYwMDU2NDIwMiwiaWF0IjoxNTk1MzgwMjAyLCJpc3MiOiJGaXJld29yayIsImp0aSI6IjZhMWM3MWJkLTFlNzAtNDIyOS05ZGQzLTdhMGZlYjQ4M2U4ZiIsIm5iZiI6MTU5NTM4MDIwMSwib2FpZCI6Impnd2U1SiIsInBlbSI6eyJ1c2VyIjpbImJhc2ljIl19LCJzdWIiOiJ1OjI3MTUwNjMiLCJ0eXAiOiJhY2Nlc3MifQ.c_f94m54SVr5t-Lxqu0hPNibeHRVAnIfjvvN7Cy6T8SYnZzVlnL3APAofVm3xAL-KwU8L_m0WdWyauSJOPlU0w'

const devToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYwMDY0ODE0OSwiaWF0IjoxNTk1NDY0MTQ5LCJpc3MiOiJGaXJld29yayIsImp0aSI6ImQ1MTQwMzRjLThiNjctNGFlYS04NDZkLWIzMDM5YzcwZDMxMyIsIm5iZiI6MTU5NTQ2NDE0OCwib2FpZCI6IkdlRWs4eSIsInBlbSI6eyJ1c2VyIjpbImJhc2ljIl19LCJzdWIiOiJ1OjEiLCJ0eXAiOiJhY2Nlc3MifQ.2UeEOby1y_JaSWcDcwGEeMQ6JmkFT19Ei2YCTuzM73LvNYF42HvS8GlE_jRYWF7Hp4tKBXKElW5AfeHvNOsTNg'

export default axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${DEV ? devToken : prodToken}`,
    'Content-Type': 'application/json'
  }
})
