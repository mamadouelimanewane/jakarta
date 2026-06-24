import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#0055a4] to-[#0070C0]">
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏍️</span>
          <span className="text-white font-bold text-2xl tracking-tight">J@KARTA</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-5 py-2 text-white/80 hover:text-white font-medium transition-colors">Connexion</Link>
          <Link href="/register" className="px-5 py-2 bg-white text-[#003366] rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">S&apos;inscrire</Link>
        </div>
      </nav>
      <section className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-1.5 rounded-full mb-6 border border-white/20">
          <span>🇸🇳</span> Plateforme digitale pour les conducteurs de moto-taxis du Sénégal
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Connecter les conducteurs,<br /><span className="text-[#FFD700]">Transformer les vies</span>
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Jakarta centralise vos démarches administratives, assurances, épargne et formations en une seule plateforme simple et accessible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-[#FFD700] text-[#003366] rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all shadow-xl">Commencer gratuitement →</Link>
          <Link href="/login" className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20">J&apos;ai déjà un compte</Link>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-8 pb-16 grid grid-cols-3 gap-6">
        {[{n:'20%',l:'Croissance du marché moto-taxis'},{n:'85/100',l:'Score de viabilité commerciale'},{n:'$8.8M',l:'Revenus projetés en 2029'}].map(s=>(
          <div key={s.n} className="text-center bg-white/10 rounded-2xl p-6 border border-white/20">
            <p className="text-4xl font-extrabold text-[#FFD700]">{s.n}</p>
            <p className="text-white/70 text-sm mt-2">{s.l}</p>
          </div>
        ))}
      </section>
      <section className="bg-white py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Nos services</h2>
          <p className="text-center text-gray-500 mb-12">Tout ce dont vous avez besoin, en un seul endroit</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {icon:'📋',t:'Régularisation',d:"Immatriculation, permis de conduire, carte grise — simplifiés et suivis en ligne."},
              {icon:'🛡️',t:'Assurances',d:"RC obligatoire, tous risques, assurance maladie avec paiement fractionné."},
              {icon:'💰',t:'Finances',d:"Compte d'épargne, micro-crédit jusqu'à 500 000 FCFA à taux compétitif."},
              {icon:'📚',t:'Formations',d:"Sécurité routière, code de la route, gestion financière en wolof & français."},
              {icon:'⭐',t:'Fidélité',d:"Gagnez des points à chaque action et échangez-les contre des récompenses."},
              {icon:'🏠',t:'Logement Social',d:"Accès facilité aux logements sociaux avec suivi de dossier en ligne."},
            ].map(s=>(
              <div key={s.t} className="p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-[#003366] text-white py-12 px-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Prêt à régulariser votre activité ?</h2>
        <p className="text-white/70 mb-6">Rejoignez des milliers de conducteurs qui font confiance à Jakarta</p>
        <Link href="/register" className="inline-block px-8 py-3 bg-[#FFD700] text-[#003366] font-bold rounded-xl hover:bg-yellow-400 transition-colors">Créer mon compte →</Link>
        <p className="text-white/40 text-sm mt-8">© 2026 Jakarta — Connect & Care · Dakar, Sénégal</p>
      </footer>
    </main>
  )
}
