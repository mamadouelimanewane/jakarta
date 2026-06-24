import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMontant(montant: number, devise = 'FCFA') {
  return `${montant.toLocaleString('fr-FR')} ${devise}`
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

export function getStatutColor(statut: string) {
  const map: Record<string, string> = {
    SOUMIS: 'bg-blue-100 text-blue-800',
    EN_COURS: 'bg-yellow-100 text-yellow-800',
    EN_ATTENTE_DOCUMENTS: 'bg-orange-100 text-orange-800',
    APPROUVE: 'bg-green-100 text-green-800',
    REJETE: 'bg-red-100 text-red-800',
    COMPLETE: 'bg-emerald-100 text-emerald-800',
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIREE: 'bg-red-100 text-red-800',
    EN_ATTENTE: 'bg-gray-100 text-gray-800',
    VALIDE: 'bg-green-100 text-green-800',
    REGULARISE: 'bg-emerald-100 text-emerald-800',
    NON_REGULARISE: 'bg-red-100 text-red-800',
  }
  return map[statut] || 'bg-gray-100 text-gray-700'
}

export function getStatutLabel(statut: string) {
  const map: Record<string, string> = {
    SOUMIS: 'Soumis',
    EN_COURS: 'En cours',
    EN_ATTENTE_DOCUMENTS: 'Docs manquants',
    APPROUVE: 'Approuvé',
    REJETE: 'Rejeté',
    COMPLETE: 'Complété',
    ACTIVE: 'Active',
    EXPIREE: 'Expirée',
    EN_ATTENTE: 'En attente',
    VALIDE: 'Validé',
    REGULARISE: 'Régularisé',
    NON_REGULARISE: 'Non régularisé',
    EN_COURS_REG: 'En cours',
    IMMATRICULATION: 'Immatriculation',
    PERMIS_CONDUIRE: 'Permis de conduire',
    RENOUVELLEMENT_PERMIS: 'Renouvellement permis',
    RENOUVELLEMENT_IMMAT: 'Renouvellement immat.',
    CARTE_GRISE: 'Carte grise',
  }
  return map[statut] || statut
}

export function calcMensualite(montant: number, taux: number, duree: number) {
  const r = taux / 100 / 12
  return montant * (r * Math.pow(1 + r, duree)) / (Math.pow(1 + r, duree) - 1)
}
