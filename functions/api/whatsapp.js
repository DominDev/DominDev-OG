/**
 * Cloudflare Pages Function - Turnstile Token Validator
 * POST /api/whatsapp
 * Validates Turnstile token and returns WhatsApp redirect URL
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonResponse({ success: false, error: "Invalid JSON" }, 400);
    }

    const { token, formData, phoneNumber } = body;

    // Validate required fields
    if (!token) {
      return jsonResponse({ success: false, error: "Missing Turnstile token" }, 400);
    }

    // Verify token with Cloudflare
    const verifyResponse = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || "",
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      return jsonResponse({
        success: false,
        error: "Weryfikacja nie powiodla sie. Sprobuj ponownie.",
        codes: verifyResult["error-codes"],
      }, 403);
    }

    // Token valid - build WhatsApp URL
    const message = buildWhatsAppMessage(formData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return jsonResponse({ success: true, url: whatsappUrl }, 200);

  } catch (error) {
    return jsonResponse({ success: false, error: "Blad serwera" }, 500);
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildWhatsAppMessage(formData) {
  if (!formData) {
    return "Czesc! Chcialbym umowic sie na probny trening wstepny.";
  }

  const parts = [];

  if (formData.name && formData.name.trim()) {
    parts.push(`Czesc! Mam na imie ${formData.name.trim()}.`);
  } else {
    parts.push("Czesc!");
  }

  const hasAge = formData.age && formData.age !== "skip";
  const hasGender = formData.gender && formData.gender !== "skip";

  if (hasAge && hasGender) {
    parts.push(`Mam ${formData.age} lat, jestem ${formData.gender}.`);
  } else if (hasAge) {
    parts.push(`Mam ${formData.age} lat.`);
  } else if (hasGender) {
    parts.push(`Jestem ${formData.gender}.`);
  }

  const hasLevel = formData.level && formData.level !== "skip";
  const hasGoal = formData.goal && formData.goal !== "skip";

  if (hasLevel && hasGoal) {
    parts.push(`Jestem na poziomie ${formData.level} i zalezy mi na ${formData.goal}.`);
  } else if (hasLevel) {
    parts.push(`Jestem na poziomie ${formData.level}.`);
  } else if (hasGoal) {
    parts.push(`Zalezy mi na ${formData.goal}.`);
  }

  parts.push("Chcialbym umowic sie na probny trening wstepny!");

  return parts.join(" ");
}
