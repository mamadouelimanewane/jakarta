import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminPwd = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { telephone: '0000000000' },
    update: {},
    create: {
      telephone: '0000000000',
      email: 'admin@jakarta.sn',
      password: adminPwd,
      nom: 'Admin',
      prenom: 'Jakarta',
      role: 'ADMIN',
      statut_kyc: 'VALIDE',
    },
  })

  // Conducteur demo
  const pwd = await bcrypt.hash('demo123', 12)
  const user = await prisma.user.upsert({
    where: { telephone: '770000001' },
    update: {},
    create: {
      telephone: '770000001',
      email: 'moussa@jakarta.sn',
      password: pwd,
      nom: 'Diallo',
      prenom: 'Moussa',
      role: 'CONDUCTEUR',
      statut_kyc: 'VALIDE',
      conducteur: {
        create: {
          adresse: 'Medina, Dakar',
          points_fidelite: 1250,
          solde_epargne: 45000,
          statut_regularisation: 'EN_COURS',
          vehicules: {
            create: {
              marque: 'Yamaha',
              modele: 'YBR 125',
              annee: 2020,
              couleur: 'Rouge',
              immatriculation: 'DK-2547-AK',
              statut: 'EN_ATTENTE',
            }
          },
          assurances: {
            create: {
              type: 'RESPONSABILITE_CIVILE',
              compagnie: 'NSIA Assurances',
              numero_police: 'NSI-2024-78543',
              prime_mensuelle: 8500,
              date_debut: new Date('2024-01-01'),
              date_fin: new Date('2025-01-01'),
              statut: 'ACTIVE',
            }
          },
          dossiers: {
            create: [
              {
                type: 'IMMATRICULATION',
                statut: 'EN_COURS',
                montant_paye: 25000,
                moyen_paiement: 'WAVE',
              },
              {
                type: 'PERMIS_CONDUIRE',
                statut: 'SOUMIS',
                montant_paye: 0,
              },
            ]
          },
          transactions: {
            create: [
              { type: 'EPARGNE_DEPOT', montant: 15000, moyen_paiement: 'WAVE', description: 'Dépôt épargne' },
              { type: 'EPARGNE_DEPOT', montant: 10000, moyen_paiement: 'ORANGE_MONEY', description: 'Dépôt épargne' },
              { type: 'PAIEMENT_DOSSIER', montant: 25000, moyen_paiement: 'WAVE', description: 'Paiement immatriculation' },
              { type: 'PAIEMENT_ASSURANCE', montant: 8500, moyen_paiement: 'WAVE', description: 'Prime assurance RC' },
            ]
          }
        }
      }
    },
    include: { conducteur: true }
  })

  // Formations
  const formations = [
    { titre: 'Sécurité Routière - Niveau 1', description: 'Les bases de la sécurité sur la route pour les conducteurs de moto-taxis', categorie: 'SECURITE', duree_minutes: 45, niveau: 'DEBUTANT' },
    { titre: 'Code de la Route Sénégal', description: 'Maîtrisez le code de la route sénégalais et les panneaux de signalisation', categorie: 'CODE_ROUTE', duree_minutes: 60, niveau: 'DEBUTANT' },
    { titre: 'Gestion Financière de Base', description: 'Gérer ses revenus, épargner et planifier ses dépenses efficacement', categorie: 'FINANCE', duree_minutes: 30, niveau: 'DEBUTANT' },
    { titre: 'Service Client Excellence', description: 'Offrir une expérience client exceptionnelle à vos passagers', categorie: 'SERVICE', duree_minutes: 40, niveau: 'INTERMEDIAIRE' },
    { titre: 'Premiers Secours Moto', description: 'Réagir en cas d\'accident et prodiguer les premiers secours', categorie: 'SECURITE', duree_minutes: 90, niveau: 'INTERMEDIAIRE' },
    { titre: 'Entretien de la Moto', description: 'Maintenir votre moto en parfait état pour éviter les pannes', categorie: 'MECANIQUE', duree_minutes: 50, niveau: 'DEBUTANT' },
  ]

  for (const f of formations) {
    await prisma.formation.upsert({
      where: { id: f.titre.slice(0,8) },
      update: {},
      create: { ...f, id: f.titre.slice(0,8) }
    })
  }

  // Progressions for demo conducteur
  const allFormations = await prisma.formation.findMany()
  if (user.conducteur) {
    for (const f of allFormations.slice(0, 2)) {
      await prisma.progression.upsert({
        where: { conducteurId_formationId: { conducteurId: user.conducteur.id, formationId: f.id } },
        update: {},
        create: {
          conducteurId: user.conducteur.id,
          formationId: f.id,
          pourcentage: f.id === allFormations[0].id ? 100 : 60,
          completee: f.id === allFormations[0].id,
          date_completion: f.id === allFormations[0].id ? new Date() : null,
        }
      })
    }
  }

  console.log('✅ Seed terminé')
  console.log('   Admin: 0000000000 / admin123')
  console.log('   Demo:  770000001 / demo123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
