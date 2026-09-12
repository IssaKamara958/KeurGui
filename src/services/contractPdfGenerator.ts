import { jsPDF } from 'jspdf';
import { PartnershipApplication, PartnershipContract } from '../types';
import { PartnershipService } from './partnershipService';

export class ContractPdfGenerator {
  /**
   * Generates a formal, professional PDF partnership & mandate contract
   * based on a validated subscriber's data, including standard 12% commission clauses.
   */
  static generatePdf(application: PartnershipApplication, contract?: PartnershipContract): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const activeContract =
      contract || application.contract || PartnershipService.generateContract(application);

    const darkColor = [24, 24, 27]; // #18181b
    const textGray = [75, 85, 99]; // #4b5563

    let y = 14;
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Helper for adding wrapped text safely
    const addWrappedText = (
      text: string,
      x: number,
      currentY: number,
      maxWidth: number,
      lineHeight = 4.2
    ): number => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, currentY + index * lineHeight);
      });
      return currentY + lines.length * lineHeight;
    };

    // -------------------------------------------------------------
    // TOP HEADER BANNER
    // -------------------------------------------------------------
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('KEUR MAME FATOU • RÉPUBLIQUE DU SÉNÉGAL • OHADA / COCC', margin + 5, y + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(167, 243, 208); // emerald-200
    doc.text(
      "CONTRAT OFFICIEL DE PARTENARIAT & MANDAT D'INTERMÉDIATION IMMOBILIÈRE (12%)",
      margin + 5,
      y + 14.5
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`RÉF : ${activeContract.contract_number}`, pageWidth - margin - 46, y + 7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text(`VALIDÉ SOUS 48H • 12%`, pageWidth - margin - 37, y + 14.5);

    y += 25;

    // -------------------------------------------------------------
    // SUB-HEADER / META
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("MANDAT D'APPORTEUR D'AFFAIRES & DE COMMERCIALISATION", margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const issuedDate = new Date(activeContract.issued_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(
      `Établi sous seing privé et validé à Thiès le ${issuedDate}. Réf dossier : ${application.id}`,
      margin,
      y
    );
    y += 6;

    // -------------------------------------------------------------
    // SECTION 1: PARTIES IDENTIFICATION
    // -------------------------------------------------------------
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('1. DÉSIGNATION ET IDENTIFICATION DES PARTIES CONTRACTANTES', margin + 3, y + 3.8);
    y += 7.5;

    const colWidth = (contentWidth - 6) / 2;

    // Party A: Plateforme & Abdou KAMARA
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, colWidth, 23, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(17, 24, 39);
    doc.text("D'UNE PART : LA DIRECTION & MANDATAIRE", margin + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(55, 65, 81);
    doc.text("M. Abdou KAMARA & Ayants droit", margin + 3, y + 9);
    doc.text("Mandataire officiel • Plateforme Keur Mame Fatou", margin + 3, y + 13);
    doc.text("Thiès, République du Sénégal", margin + 3, y + 17);
    doc.text("Contacts : +221 77 638 17 01 / +221 77 236 41 44", margin + 3, y + 21);

    // Party B: Partenaire Souscripteur
    const xPartyB = margin + colWidth + 6;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xPartyB, y, colWidth, 23, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(17, 24, 39);
    doc.text("D'AUTRE PART : LE PARTENAIRE SOUSCRIPTEUR", xPartyB + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(55, 65, 81);

    const roleLabel =
      application.applicant_role === 'proprietaire'
        ? 'Propriétaire en titre'
        : application.applicant_role === 'mandataire'
        ? 'Mandataire officiel du titulaire'
        : application.applicant_role === 'ayant_droit'
        ? 'Ayant droit successoral'
        : 'Promoteur / Apporteur';

    doc.text(`Nom : ${application.owner_full_name} (${roleLabel})`, xPartyB + 3, y + 9);
    doc.text(`Téléphone : ${application.owner_phone}`, xPartyB + 3, y + 13);
    if (application.owner_email) {
      doc.text(`Email : ${application.owner_email}`, xPartyB + 3, y + 17);
    } else if (application.is_mandated && application.mandatary_name) {
      doc.text(`Mandataire désigné : ${application.mandatary_name} (${application.mandatary_phone || ''})`, xPartyB + 3, y + 17);
    } else {
      doc.text(`Qualité légale : Certifiée sur l'honneur`, xPartyB + 3, y + 17);
    }
    const cinStatus =
      application.is_mandated && application.mandatary_cin
        ? `CNI Mandataire : ${application.mandatary_cin}`
        : "Pièce d'identité : CNI Recto/Verso vérifiée par la modération";
    doc.text(cinStatus, xPartyB + 3, y + 21);

    y += 27;

    // -------------------------------------------------------------
    // SECTION 2: BIEN IMMOBILIER
    // -------------------------------------------------------------
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('2. CARACTÉRISTIQUES ET DÉSIGNATION DU BIEN IMMOBILIER', margin + 3, y + 3.8);
    y += 7.5;

    doc.setFillColor(254, 243, 199); // amber-100
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text(`Titre : ${application.title}`, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    doc.text(
      `Type : ${application.property_type.toUpperCase()} • Superficie : ${application.surface} ${application.surface_unit} • Ville : ${application.city} (${application.neighborhood})`,
      margin + 4,
      y + 9
    );
    const titleDeedText = `Titre juridique : ${application.title_deed_type.toUpperCase()} ${
      application.title_deed_number ? `(N° ${application.title_deed_number})` : ''
    } • Plan cadastral et bornage géomètre annexés`;
    doc.text(titleDeedText, margin + 4, y + 13.5);

    if (application.latitude && application.longitude) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.text(
        `Pointage satellitaire GPS : Lat ${application.latitude.toFixed(5)}°, Lon ${application.longitude.toFixed(5)}°`,
        margin + 4,
        y + 17
      );
    }
    y += 22;

    // -------------------------------------------------------------
    // SECTION 3: CONDITIONS FINANCIÈRES & CLAUSE 12% COMMISSION
    // -------------------------------------------------------------
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('3. CLAUSE ESSENTIELLE DE RÉMUNÉRATION : COMMISSION DE 12% TTC', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(6, 78, 59);

    const minPriceFormatted = PartnershipService.formatPrice(application.minimum_price, application.currency);
    const commissionVal = application.estimated_commission || PartnershipService.calculateCommission(application.minimum_price);
    const commissionFormatted = PartnershipService.formatPrice(commissionVal, application.currency);

    const clauseText1 =
      "En contrepartie des diligences d'intermédiation, des campagnes publicitaires ciblées (web, TikTok, réseaux direct), de la mise en valeur audiovisuelle et de la sélection d'acquéreurs solvables, une commission forfaitaire exclusive de DOUZE POUR CENT (12%) TTC est expressément convenue.";
    const clauseText2 =
      "Cette commission est due intégralement lors de la signature de l'acte authentique de vente par-devant notaire instrumentaire ou lors du paiement effectif du prix de cession.";

    let currTextY = addWrappedText(clauseText1, margin + 4, y + 8.5, contentWidth - 8, 3.8);
    currTextY = addWrappedText(clauseText2, margin + 4, currTextY + 0.5, contentWidth - 8, 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text(
      `Prix Net Vendeur Minimum : ${minPriceFormatted}  |  Commission Partenaire (12%) : ${commissionFormatted}`,
      margin + 4,
      y + 23.5
    );

    y += 30;

    // -------------------------------------------------------------
    // SECTION 4: CLAUSES STANDARDS DU CONTRAT DE PARTENARIAT
    // -------------------------------------------------------------
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('4. CONDITIONS PARTICULIÈRES ET CLAUSES CONTRACTUELLES STANDARDS', margin + 3, y + 3.8);
    y += 7.5;

    const standardClauses = [
      {
        article: 'Article 1 — Mandat & Diffusion :',
        body: "Le mandant concède au mandataire le droit d'assurer la promotion continue du bien via la plateforme web, les diffusions TikTok interactives, le réseau WhatsApp et les relations avec la diaspora et investisseurs institutionnels.",
      },
      {
        article: "Article 2 — Garantie d'Authenticité :",
        body: "Le mandant certifie sous sa responsabilité pénale et civile l'exactitude des pièces fournies (titre foncier, bail, délibération, CNI recto-verso) et garantit la plateforme contre tout litige d'éviction ou contestation successorale.",
      },
      {
        article: 'Article 3 — Seuil de Prix Garanti :',
        body: `Le mandataire s'interdit formellement de valider une offre inférieure au montant net convenu de ${minPriceFormatted} sans accord écrit préalable du mandant. Tout surplus négocié profite d'un commun accord aux parties.`,
      },
      {
        article: 'Article 4 — Durée & Résiliation :',
        body: 'Le présent contrat est consenti pour une durée initiale de six (6) mois, renouvelable par tacite reconduction. Résiliable par lettre recommandée ou notification électronique avec préavis de 15 jours.',
      },
      {
        article: 'Article 5 — Confidentialité & Données :',
        body: "Les coordonnées du propriétaire et les documents cadastraux originaux ne sont communiqués qu'aux acquéreurs sérieux ayant justifié d'une capacité financière validée par la direction.",
      },
      {
        article: 'Article 6 — Droit Applicable & Litiges :',
        body: 'Le contrat est régi par le droit sénégalais (COCC) et les Actes Uniformes de l’OHADA. Tout différend sera soumis aux tribunaux compétents du ressort de Thiès / Dakar à défaut de règlement amiable.',
      },
    ];

    standardClauses.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(item.article, margin + 2, y);

      const titleWidth = doc.getTextWidth(item.article) + 2;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);

      // Wrap remaining body
      const remainingWidth = contentWidth - titleWidth - 4;
      const lines = doc.splitTextToSize(item.body, remainingWidth);

      if (lines.length > 0) {
        doc.text(lines[0], margin + 2 + titleWidth, y);
        for (let i = 1; i < lines.length; i++) {
          y += 3.4;
          doc.text(lines[i], margin + 4, y);
        }
      }
      y += 4.8;
    });

    y += 2;

    // -------------------------------------------------------------
    // SIGNATURES & OFFICIAL STAMP
    // -------------------------------------------------------------
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    const sigBoxWidth = (contentWidth - 8) / 2;

    // Signature 1: Mandataire / Abdou KAMARA
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, sigBoxWidth, 29, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('POUR LA DIRECTION DE LA PLATEFORME', margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text('M. Abdou KAMARA • Mandataire Délégué', margin + 3, y + 8.5);

    // Official Visa Stamp
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin + 3, y + 11.5, sigBoxWidth - 6, 11, 1.5, 1.5, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(5, 150, 105);
    doc.text('✓ VISA & SCEAU OFFICIEL CONFORME', margin + 6, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text(`Enregistré et certifié valide 48h • Thiès, le ${issuedDate}`, margin + 6, y + 20);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('Mandataire officiel de vente immobilière', margin + 3, y + 26);

    // Signature 2: Souscripteur
    const xSig2 = margin + sigBoxWidth + 8;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xSig2, y, sigBoxWidth, 29, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('POUR LE PARTENAIRE SOUSCRIPTEUR', xSig2 + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(`${application.owner_full_name}`, xSig2 + 3, y + 8.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('Mention manuscrite : "Lu et approuvé, bon pour mandat avec 12% de commission"', xSig2 + 3, y + 13.5);
    doc.text('Signature électronique authentifiée par CNI recto/verso', xSig2 + 3, y + 18);
    doc.text(`Accord contractuel n° ${activeContract.contract_number}`, xSig2 + 3, y + 22.5);

    y += 33;

    // -------------------------------------------------------------
    // FOOTER DISCLAIMER
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Document contractuel original généré automatiquement via la plateforme Keur Mame Fatou (Votre confort, notre priorité) • Réf: ${activeContract.contract_number} • Page 1/1`,
      margin,
      y
    );

    // Trigger download
    const cleanId = application.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanOwner = application.owner_full_name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const fileName = `Contrat_Partenariat_12%_${cleanId}_${cleanOwner}.pdf`;
    doc.save(fileName);
  }
}
