const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const adminPwd = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { telephone: '0000000000' },
    update: {},
    create: { telephone: '0000000000', email: 'admin@jakarta.sn', password: adminPwd, nom: 'Admin', prenom: 'Jakarta', role: 'ADMIN', statut_kyc: 'VALIDE' }
  })

  const pwd = await bcrypt.hash('demo123', 12)
  const user = await prisma.user.upsert({
    where: { telephone: '770000001' },
    update: {},
    create: {
      telephone: '770000001', email: 'moussa@jakarta.sn', password: pwd,
      nom: 'Diallo', prenom: 'Moussa', role: 'CONDUCTEUR', statut_kyc: 'VALIDE',
      conducteur: {
        create: {
          adresse: 'Medina, Dakar', points_fidelite: 1250, solde_epargne: 45000,
          statut_regularisation: 'EN_COURS', numero_cni: '1234567890123',
          vehicules: { create: { marque: 'Yamaha', modele: 'YBR 125', annee: 2020, couleur: 'Rouge', immatriculation: 'DK-2547-AK', statut: 'EN_ATTENTE' }},
          assurances: { create: { type: 'RESPONSABILITE_CIVILE', compagnie: 'NSIA Assurances', numero_police: 'NSI-2024-78543', prime_mensuelle: 8500, date_debut: new Date('2024-01-01'), date_fin: new Date('2025-12-31'), statut: 'ACTIVE' }},
          dossiers: { create: [
            { type: 'IMMATRICULATION', statut: 'EN_COURS', montant_paye: 25000, moyen_paiement: 'WAVE' },
            { type: 'PERMIS_CONDUIRE', statut: 'SOUMIS', montant_paye: 0 }
          ]},
          transactions: { create: [
            { type: 'EPARGNE_DEPOT', montant: 25000, moyen_paiement: 'WAVE', description: 'Dépôt épargne initial' },
            { type: 'EPARGNE_DEPOT', montant: 10000, moyen_paiement: 'ORANGE_MONEY', description: 'Dépôt épargne' },
            { type: 'EPARGNE_DEPOT', montant: 10000, moyen_paiement: 'WAVE', description: 'Dépôt épargne' },
            { type: 'PAIEMENT_DOSSIER', montant: 25000, moyen_paiement: 'WAVE', description: 'Paiement immatriculation' },
            { type: 'PAIEMENT_ASSURANCE', montant: 8500, moyen_paiement: 'WAVE', description: 'Prime assurance RC' }
          ]}
        }
      }
    },
    include: { conducteur: true }
  })

  const formations = [
    { id: 'f1', titre: 'Sécurité Routière - Niveau 1', description: 'Les bases de la sécurité sur la route pour les conducteurs de moto-taxis', categorie: 'SECURITE', duree_minutes: 45, niveau: 'DEBUTANT' },
    { id: 'f2', titre: 'Code de la Route Sénégal', description: 'Maîtrisez le code de la route sénégalais et les panneaux de signalisation', categorie: 'CODE_ROUTE', duree_minutes: 60, niveau: 'DEBUTANT' },
    { id: 'f3', titre: 'Gestion Financière de Base', description: 'Gérer ses revenus, épargner et planifier ses dépenses efficacement', categorie: 'FINANCE', duree_minutes: 30, niveau: 'DEBUTANT' },
    { id: 'f4', titre: 'Service Client Excellence', description: 'Offrir une expérience client exceptionnelle à vos passagers', categorie: 'SERVICE', duree_minutes: 40, niveau: 'INTERMEDIAIRE' },
    { id: 'f5', titre: 'Premiers Secours Moto', description: "Réagir en cas d'accident et prodiguer les premiers secours", categorie: 'SECURITE', duree_minutes: 90, niveau: 'INTERMEDIAIRE' },
    { id: 'f6', titre: 'Entretien de la Moto', description: 'Maintenir votre moto en parfait état pour éviter les pannes', categorie: 'MECANIQUE', duree_minutes: 50, niveau: 'DEBUTANT' },
  ]

  for (const f of formations) {
    await prisma.formation.upsert({ where: { id: f.id }, update: {}, create: f })
  }

  if (user.conducteur) {
    await prisma.progression.upsert({
      where: { conducteurId_formationId: { conducteurId: user.conducteur.id, formationId: 'f1' }},
      update: {}, create: { conducteurId: user.conducteur.id, formationId: 'f1', pourcentage: 100, completee: true, date_completion: new Date() }
    })
    await prisma.progression.upsert({
      where: { conducteurId_formationId: { conducteurId: user.conducteur.id, formationId: 'f2' }},
      update: {}, create: { conducteurId: user.conducteur.id, formationId: 'f2', pourcentage: 60, completee: false }
    })
  }

  await prisma.notification.createMany({ data: [
    { userId: user.id, titre: 'Bienvenue sur Jakarta ! 🎉', message: 'Votre compte a été créé avec succès. Commencez par régulariser votre situation administrative.', type: 'SUCCESS' },
    { userId: user.id, titre: 'Dossier en cours', message: 'Votre dossier d\'immatriculation est en cours de traitement. Délai estimé : 5-7 jours ouvrables.', type: 'INFO' },
  ]})

  console.log('✅ Seed terminé !')
  console.log('   Compte démo : 770000001 / demo123')
  console.log('   Compte admin: 0000000000 / admin123')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
