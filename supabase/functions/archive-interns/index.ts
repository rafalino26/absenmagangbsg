import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
import { PrismaClient } from '../_shared/prisma-client/edge.js'
import { PrismaPg } from '../_shared/prisma-client/adapterPg.ts'


const connectionString = Deno.env.get('DATABASE_URL_DIRECT')!

serve(async (req) => {
  try {
    const pool = new Pool(connectionString, 3, true)
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

     const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    const expiredInterns = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'INTERN',
        periodEndDate: {
          lt: today,
        },
      },
    })

    if (expiredInterns.length === 0) {
      return new Response(JSON.stringify({ message: "Tidak ada peserta yang perlu diarsip." }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const idsToArchive = expiredInterns.map(intern => intern.id)
    await prisma.user.updateMany({
      where: { id: { in: idsToArchive } },
      data: { isActive: false },
    })

    const successMessage = `Berhasil mengarsipkan ${idsToArchive.length} peserta.`
    return new Response(JSON.stringify({ message: successMessage }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
