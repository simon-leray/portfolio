"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setState("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const inputClass =
    "w-full bg-transparent border-b border-ink/20 focus:border-red outline-none py-3 text-ink placeholder:text-ink/30 transition-colors duration-200 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-xs tracking-widest uppercase text-ink/50 mb-2">
          Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ihr Name"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-ink/50 mb-2">
          E-Mail
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="ihre@email.ch"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs tracking-widest uppercase text-ink/50 mb-2">
          Nachricht
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Ihre Nachricht..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-ink text-paper py-4 text-sm tracking-widest uppercase hover:bg-red transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "1rem" }}
      >
        {state === "loading" ? "Wird gesendet…" : "Senden"}
      </button>

      {state === "success" && (
        <p className="text-center text-sm text-ink/70">
          Vielen Dank — Ihre Nachricht wurde gesendet.
        </p>
      )}
      {state === "error" && (
        <p className="text-center text-sm text-red">
          Fehler beim Senden. Bitte versuchen Sie es erneut.
        </p>
      )}
    </form>
  );
}
