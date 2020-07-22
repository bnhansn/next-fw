import axios from 'axios'

const DEV = process.env.NODE_ENV === 'development'

const API_URL = DEV ? 'http://localhost:4000' : 'https://fireworktv.com'

const prodToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJGaXJld29yayIsImV4cCI6MTYwMDU1NzkzOSwiaWF0IjoxNTk1MzczOTM5LCJpc3MiOiJGaXJld29yayIsImp0aSI6IjdjMjU0Mzc4LTYzYzMtNGE5Ni1hNWFlLTM4MzdmMzA3NTY3YyIsIm5iZiI6MTU5NTM3MzkzOCwib2FpZCI6IlZnMThvTyIsInBlbSI6eyJ1c2VyIjpbImJhc2ljIl19LCJzdWIiOiJ1OjEwMDE5ODMzMSIsInR5cCI6ImFjY2VzcyJ9.YA-nrwJG-wJ3okfqphCM05m7G3e1Mi51JOT8UM17X8I3b1OChyK7VvEkRgxRa8PiAE0AquzJTjgWFm5VL6M3mg'

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
