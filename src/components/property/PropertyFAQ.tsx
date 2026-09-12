import React, { useState } from 'react';
import { Property } from '../../types';
import {
  HelpCircle,
  ChevronDown,
  CreditCard,
  FileCheck,
  MapPin,
  Users,
  Key,
  ShieldCheck,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyFAQProps {
  property: Property;
}

interface FAQItem {
  id: string;
  category: 'payment' | 'docs' | 'visit' | 'legal';
  categoryLabel: string;
  question: string;
  icon: React.ElementType;
  answer: React.ReactNode;
}

export const PropertyFAQ: React.FC<PropertyFAQProps> = ({ property }) => {
  const [openItem, setOpenItem] = useState<string | null>('faq-docs');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqItems: FAQItem[] = [
    {
      id: 'faq-payment',
      category: 'payment',
      categoryLabel: 'Paiement & Prix',
      question: 'Quelles sont les modalités de paiement pour acquérir le bien ?',
      icon: CreditCard,
      answer: (
        <div className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Le prix de vente est fixé à{' '}
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
              {property.price.toLocaleString('fr-FR')} {property.currency}
            </strong>{' '}
            (Net vendeur garanti).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-300">
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Sécurité notariée :</strong> La transaction s'opère obligatoirement par l'intermédiaire d'une étude notariale reconnue au Sénégal.
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Mode de règlement :</strong> Virement bancaire certifié ou chèque de banque déposé sur le compte séquestre du notaire instrumentaire.
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Échelonnement :</strong> Un acompte avec signature d'un compromis de vente sous conditions suspensives peut être convenu en concertation avec les ayants droit.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'faq-docs',
      category: 'docs',
      categoryLabel: 'Documents & Juridique',
      question: 'Quels documents administratifs et titres de propriété sont fournis ?',
      icon: FileCheck,
      answer: (
        <div className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Le dossier juridique de <strong className="text-neutral-900 dark:text-neutral-100">Keur Mame Fatou</strong> a été intégralement audité et vérifié :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs block">
                1. Acte de propriété & délibération
              </span>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Titre foncier / affectation régulière pour les {property.surface} {property.unit}.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs block">
                2. Plan de bornage officiel
              </span>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Certifié par géomètre-expert délimitant exactement les 600 m².
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs block">
                3. Acte d'hérédité & succession
              </span>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Validation juridique sans litige au profit des descendants de Fatou Ba.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs block">
                4. Mandat de vente officiel (12%)
              </span>
              <span className="text-2xs text-neutral-500 dark:text-neutral-400 mt-0.5 block">
                Pouvoir formel et exclusif accordé à {property.seller.name}.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'faq-visit',
      category: 'visit',
      categoryLabel: 'Processus de Visite',
      question: 'Comment organiser une visite sur place (durée estimée : 10 min) ?',
      icon: Clock,
      answer: (
        <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Les visites sont simples, directes et rapides. Comptez environ <strong className="text-emerald-700 dark:text-emerald-400">10 minutes</strong> sur place pour apprécier la configuration du terrain et de la bâtisse :
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-neutral-600 dark:text-neutral-300">
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Prise de contact :</strong> Cliquez sur le bouton WhatsApp du mandataire ({property.seller.name}) en bas de page pour fixer votre jour et heure de passage.
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Rendez-vous sur site :</strong> Accueil personnalisé sur la parcelle de {property.surface} {property.unit} à {property.city || property.country}.
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">Visite guidée :</strong> Examen des limites de propriété, des raccordements eau & électricité (Senelec/Sen'Eau), de la structure du bâtiment et des accès routiers.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'faq-roles',
      category: 'legal',
      categoryLabel: 'Mandataire & Propriétaires',
      question: 'Quelle est la relation entre les propriétaires légitimes et le mandataire ?',
      icon: Users,
      answer: (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Les propriétaires légitimes sont les héritiers directs de la famille ({property.owners[0]?.name || 'Descendants de Fatou Ba'}). Afin de garantir une négociation sereine et une transparence totale, la famille a mandaté exclusivement <strong className="text-neutral-900 dark:text-neutral-100">{property.seller.name}</strong>. Vous avez ainsi la certitude d'échanger avec un représentant officiel habilité, éliminant tout intermédiaire sauvage ou frais masqué.
        </p>
      ),
    },
    {
      id: 'faq-possession',
      category: 'legal',
      categoryLabel: 'Délais & Clés',
      question: 'Quels sont les délais de prise de possession et de remise des clés ?',
      icon: Key,
      answer: (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Le bien est immédiatement disponible, libre de toute occupation, bail ou litige locatif. Dès la signature de l'acte authentique chez le notaire et la consignation du montant de la vente, les clés et l'entière jouissance du terrain de 600 m² vous sont remises séance tenante.
        </p>
      ),
    },
    {
      id: 'faq-commission',
      category: 'payment',
      categoryLabel: 'Frais & Transparence',
      question: 'L’acquéreur doit-il payer des frais d’agence supplémentaires ?',
      icon: ShieldCheck,
      answer: (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Non. La rémunération du mandat commercial (12%) est strictement régie par le contrat de partenariat conclu avec les vendeurs. En tant qu'acquéreur, vous ne payez que le prix convenu du bien et les frais d'enregistrement/droits de mutation notariés légaux de la République du Sénégal.
        </p>
      ),
    },
  ];

  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'payment', label: 'Paiement & Prix' },
    { id: 'docs', label: 'Documents & Titres' },
    { id: 'visit', label: 'Visite (10 min)' },
    { id: 'legal', label: 'Sécurité & Notaire' },
  ];

  const filteredItems = activeCategory === 'all'
    ? faqItems
    : faqItems.filter((item) => item.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      className="space-y-6 pt-4 pb-2 border-t border-neutral-200/70 dark:border-neutral-800/70"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Questions Fréquentes (FAQ Vente & Visite)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Tout ce qu'il faut savoir sur les modalités de paiement, documents juridiques et visites sur place.
            </p>
          </div>
        </div>

        <a
          href="#whatsapp-contact-section"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-300/60 dark:border-emerald-800/60 transition-all cursor-pointer w-fit"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Poser une autre question</span>
        </a>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isOpen = openItem === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-neutral-900 border-emerald-500/40 dark:border-emerald-500/40 shadow-sm'
                  : 'bg-white/80 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-3xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {item.question}
                    </h3>
                  </div>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'rotate-180 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Help Banner CTA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-neutral-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-neutral-900 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Besoin d'un renseignement complémentaire ?
            </h4>
            <p className="text-2xs sm:text-xs text-neutral-600 dark:text-neutral-400">
              Le mandataire {property.seller.name} répond directement à vos interrogations sur WhatsApp.
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/221${property.seller.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Bonjour M. ${property.seller.name}, j'ai consulté la FAQ de Keur Mame Fatou et j'aimerais avoir des précisions avant de planifier ma visite.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discuter avec le mandataire</span>
        </a>
      </div>
    </section>
  );
};
