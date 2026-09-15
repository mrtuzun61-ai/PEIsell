const cards = [
  ['Total users', '—'],
  ['Active listings', '—'],
  ['Expired listings', '—'],
  ['Open reports', '—'],
  ['Listing revenue', '—'],
  ['Boost revenue', '—'],
];

export default function AdminHome() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 4 }}>ShootGo Admin</h1>
      <p style={{ color: '#666', marginTop: 0 }}>Users, listings, reports, payments and business configuration.</p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        {cards.map(([label, value]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 16, padding: 18 }}>
            <div style={{ color: '#666', fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24, background: '#fff', borderRadius: 16, padding: 18 }}>
        <h2>Next wiring</h2>
        <p>Connect server-side Supabase admin queries here. Never expose the service role key to browser client code.</p>
      </section>
    </main>
  );
}
