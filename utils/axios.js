import axios from 'axios'

const DEV = process.env.NODE_ENV === 'development'

const API_URL = DEV
  ? 'http://localhost:4000'
  : 'https://vercel.sandbox.fireworktv.com'

const prodToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYwMDU2NDIwMiwiaWF0IjoxNTk1MzgwMjAyLCJpc3MiOiJGaXJld29yayIsImp0aSI6IjZhMWM3MWJkLTFlNzAtNDIyOS05ZGQzLTdhMGZlYjQ4M2U4ZiIsIm5iZiI6MTU5NTM4MDIwMSwib2FpZCI6Impnd2U1SiIsInBlbSI6eyJ1c2VyIjpbImJhc2ljIl19LCJzdWIiOiJ1OjI3MTUwNjMiLCJ0eXAiOiJhY2Nlc3MifQ.c_f94m54SVr5t-Lxqu0hPNibeHRVAnIfjvvN7Cy6T8SYnZzVlnL3APAofVm3xAL-KwU8L_m0WdWyauSJOPlU0w'

const devToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhZGMiOnsic3NfdXNlcl9pZCI6IjU2NjE4ZGVmLTFiMTAtNGYyMS04MTk3LWI3NmI5MGFjYjMxMiJ9LCJhdWQiOiJGaXJld29yayIsImV4cCI6MTU5NTQxNzQxMiwiaWF0IjoxNTk1Mzc0MjEyLCJpc3MiOiJGaXJld29yayIsImp0aSI6IjdiMjJiYjZmLTE0Y2EtNDI5My05ZWU2LWFkYmVmNDRiMWMwZSIsIm5iZiI6MTU5NTM3NDIxMSwicGVtIjp7InVzZXIiOlsiYmFzaWMiXX0sInNpZCI6IjE1OTUzNzQyMTIiLCJzdWIiOiJ1OjEiLCJ0eXAiOiJhY2Nlc3MifQ.47_MgF1VEqNKJbSo0nrOdHfvf-x6FdIYFkoGoFaY0Pw2J_j-oLCCNL2B7ABYyH2hcGEzdbZUIbeDodJ1Pj9_Bw'

export default axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${DEV ? devToken : prodToken}`,
    'Content-Type': 'application/json'
  }
})
