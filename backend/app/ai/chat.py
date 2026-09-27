from typing import Dict, Any, List, Optional
from app.config import settings
from app.ai.prompts import CHAT_SYSTEM_PROMPT

def run_chat_query(
    message: str,
    deviation_context: Optional[Dict[str, Any]] = None,
    raw_text: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Answers user questions regarding the deviation using Groq LLM or pharmaceutical QMS assistant logic.
    """
    msg_lower = message.lower()
    
    # Try calling Groq if key is available
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip() != "":
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY.strip())
            
            context_summary = []
            if deviation_context:
                for k, v in deviation_context.items():
                    if v:
                        context_summary.append(f"{k}: {v}")
            
            prompt_context = "\n".join(context_summary)
            if raw_text:
                prompt_context += f"\n\nRaw Document Text:\n{raw_text}"

            messages = [
                {"role": "system", "content": f"{CHAT_SYSTEM_PROMPT}\n\nCURRENT DEVIATION CONTEXT:\n{prompt_context}"}
            ]
            
            if history:
                for h in history[-4:]: # include recent history
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                    
            messages.append({"role": "user", "content": message})

            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.2,
                max_tokens=600,
            )
            return {
                "response": response.choices[0].message.content,
                "is_demo_mode": False,
                "sources": ["Groq Llama 3.3", "Deviation Context"]
            }
        except Exception as e:
            print(f"Chat Groq API failed: {e}. Falling back to QMS assistant.")

    # Intelligent Pharmaceutical fallback response
    ctx = deviation_context or {}
    batch = ctx.get("batch_lot_number") or "the identified batch"
    severity = ctx.get("initial_severity") or "Major"
    impact = ctx.get("initial_impact") or "Product Quality"
    title = ctx.get("title") or "this deviation"
    desc = ctx.get("detailed_description") or ""

    if "why" in msg_lower and ("severity" in msg_lower or "major" in msg_lower or "critical" in msg_lower):
        reply = (
            f"The severity was recommended as **{severity}** because the deviation involves a parameter or condition "
            f"that directly threatens or deviates from validated operating conditions ({title}). In API manufacturing, "
            f"uncontrolled excursions can lead to degradant formation or altered crystallization kinetics, thus requiring formal QA investigation."
        )
    elif "capa" in msg_lower or "corrective" in msg_lower or "action" in msg_lower or "what should i do" in msg_lower:
        reply = (
            f"For deviation '{title}', recommended immediate actions include:\n"
            f"1. **Quarantine:** Place {batch} on QA hold immediately in the ERP system.\n"
            f"2. **Equipment Check:** Verify reactor temperature sensors and thermocouple calibration logs.\n"
            f"3. **Analytical Testing:** Submit representative in-process samples for impurity profile and assay testing against API specifications.\n"
            f"4. **Root Cause Analysis:** Perform a 5-Why or Fishbone analysis on the control loop and operator response."
        )
    elif "batch" in msg_lower or "lot" in msg_lower:
        reply = f"The affected lot is **{batch}**. It should be placed under QA quarantine status until in-process analytical testing and stability impact assessments are finalized."
    elif "impact" in msg_lower:
        reply = f"The initial impact is classified under **{impact}**. Because processing parameters varied from standard operating boundaries, product quality and release criteria must be thoroughly evaluated."
    elif "temperature" in msg_lower or "reactor" in msg_lower:
        reply = f"According to the incident records: '{desc}'. The thermal spike should be evaluated against product thermal degradation limits."
    else:
        reply = (
            f"Based on the deviation record for **{title}** (Batch: {batch}), the event is categorized under **{impact}** with recommended severity **{severity}**.\n\n"
            f"Key recommendation: Ensure physical and electronic quarantine of the batch, inspect instrument calibration records, and obtain Quality Unit sign-off before any reprocessing."
        )

    return {
        "response": reply,
        "is_demo_mode": True,
        "sources": ["AIVOA Knowledge Base", "Deviation Details"]
    }
