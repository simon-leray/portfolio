interface Props {
  email?: string;
  phone?: string;
}

export function ContactDetails({ email, phone }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {email && (
        <a
          href={`mailto:${email}`}
          className="group border-l-[3px] border-red pl-6 transition-opacity hover:opacity-75"
        >
          <p className="text-red text-xs tracking-widest uppercase mb-3">E-Mail</p>
          <p
            className="leading-none text-ink group-hover:text-red transition-colors duration-150 overflow-hidden"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em", fontSize: "clamp(1rem, 5vw, 3rem)", whiteSpace: "nowrap" }}
          >
            {email}
          </p>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="group border-l-[3px] border-red pl-6 transition-opacity hover:opacity-75"
        >
          <p className="text-red text-xs tracking-widest uppercase mb-3">Telefon</p>
          <p
            className="leading-none text-ink group-hover:text-red transition-colors duration-150 overflow-hidden"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em", fontSize: "clamp(1rem, 5vw, 3rem)", whiteSpace: "nowrap" }}
          >
            {phone}
          </p>
        </a>
      )}
    </div>
  );
}
