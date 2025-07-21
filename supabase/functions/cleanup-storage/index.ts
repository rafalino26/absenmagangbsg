import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const BUCKET_NAME = 'attendance-proofs';
    const FOLDER_TO_CLEAN = 'proofs'; 

    const { data: files, error: listError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .list(FOLDER_TO_CLEAN, { 
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (listError) throw listError;
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ message: `Tidak ada file di dalam folder '${FOLDER_TO_CLEAN}'.` }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filesToDelete = files.filter(file => {
      const createdAtDate = new Date(file.created_at);
      return createdAtDate <= sevenDaysAgo;
    });

    if (filesToDelete.length === 0) {
      return new Response(JSON.stringify({ message: "Tidak ada file yang perlu dihapus." }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileNamesToDelete = filesToDelete.map(file => `${FOLDER_TO_CLEAN}/${file.name}`); 

    const { error: removeError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove(fileNamesToDelete);

    if (removeError) throw removeError;

    const successMessage = `Berhasil menghapus ${fileNamesToDelete.length} file dari folder '${FOLDER_TO_CLEAN}'.`;
    return new Response(JSON.stringify({ message: successMessage, deletedFiles: fileNamesToDelete }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});