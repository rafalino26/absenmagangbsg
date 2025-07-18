import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PrismaClient } from '../_shared/prisma-client/edge.js'
import { PrismaPg } from '../_shared/prisma-client/adapterPg.ts'

const connectionString = Deno.env.get('DATABASE_URL_DIRECT')!

serve(async (req) => {
  try {
    const pool = new Pool(connectionString, 3, true)
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const expiredInterns = await prisma.user.findMany({
      where: {
        isActive: true,
        role: 'INTERN',
        periodEndDate: { lt: today },
      },
      select: { 
        id: true,
        profilePicUrl: true, 
      },
    });

    if (expiredInterns.length === 0) {
      return new Response(JSON.stringify({ message: "Tidak ada peserta yang perlu diarsip." }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const idsToArchive = expiredInterns.map(intern => intern.id);
    await prisma.user.updateMany({
      where: { id: { in: idsToArchive } },
      data: { isActive: false },
    });

    const avatarPathsToDelete = expiredInterns
      .filter(intern => intern.profilePicUrl) 
      .map(intern => {
        const urlParts = intern.profilePicUrl!.split('/avatars/');
        return `avatars/${urlParts[1]}`;
      });

    let deleteMessage = "";
    if (avatarPathsToDelete.length > 0) {
      try {
        const { error: removeError } = await supabaseClient.storage
          .from('attendance-proofs')
          .remove(avatarPathsToDelete);
        
        if (removeError) throw removeError;
        
        deleteMessage = `dan berhasil menghapus ${avatarPathsToDelete.length} foto profil.`
      } catch (storageError) {
        console.error("Gagal menghapus beberapa foto profil:", storageError.message);
        deleteMessage = "tetapi beberapa foto profil gagal dihapus (lihat log untuk detail)."
      }
    }

    const successMessage = `Berhasil mengarsipkan ${idsToArchive.length} peserta ${deleteMessage}`;
    return new Response(JSON.stringify({ message: successMessage }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})