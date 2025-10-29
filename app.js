import cluster from 'node:cluster'
import http from 'node:http'
import { availableParallelism } from 'node:os'
import process from 'node:process'

// 👇 Tillad manuel override via miljøvariabel (ellers brug antal CPU-kerner)
const numCPUs = Number(process.env.WORKERS) || availableParallelism()

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)

  // Opret én worker per CPU (eller efter WORKERS-variablen)
  for (let i = 0; i < numCPUs; i++) cluster.fork()

  // Hvis en worker dør, log det
  cluster.on('exit', (worker) => console.log(`worker ${worker.process.pid} died`))
} else {
  // Selve HTTP-serveren (hver worker håndterer forbindelser)
  http.createServer((req, res) => {
    res.writeHead(200)
    res.end(`hello from worker ${process.pid}\n`)
  }).listen(8000)
  

  console.log(`Worker ${process.pid} started`)
}
