import { supabase } from "@/lib/services/supabaseClient";

/**
 * @param {object} param0
 */
export async function addFeedback({ interview_uuid, user_name, user_email, feedback, recommended }) {
  try {
  
    let interview = null;
    let interviewError = null;

    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("interview_id")
        .eq("interview_id", interview_uuid)
        .maybeSingle();

      interview = data;
      interviewError = error;
    } catch (e) {
    
      interview = null;
      interviewError = e;
    }

    if (!interview) {
      try {
        const { data, error } = await supabase
          .from('"Interviews"')
          .select("interview_id")
          .eq("interview_id", interview_uuid)
          .maybeSingle();

        interview = data;
        interviewError = error;
      } catch (e) {
        interview = null;
        interviewError = e;
      }
    }

    if (interviewError) {
      
      console.warn("DB lookup returned error:", interviewError);
    }

    if (!interview) {
      throw new Error("Interview not found. Cannot add feedback.");
    }

    const payload = {
      interview_id: interview.interview_id,
      user_name,
      user_email,
      feedback,
      recommended,
    };

    const { error } = await supabase.from("interview_feedback").insert(payload);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("Failed to add feedback:", err);
    return { success: false, message: err.message || String(err) };
  }
}
