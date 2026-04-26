import React, { useState } from 'react';
import CardHeader from '../dashboard_components/CardHeader';

const VARS_REFUS = [
  { tag: '{prenom}', label: 'Prénom du candidat' },
  { tag: '{nom}', label: 'Nom' },
  { tag: '{poste}', label: 'Titre du poste' },
];

const VARS_RECRUTEMENT = [
  { tag: '{prenom}', label: 'Prénom du candidat' },
  { tag: '{nom}', label: 'Nom' },
  { tag: '{poste}', label: 'Titre du poste' },
  { tag: '{details_integration}', label: 'Encadré d\'intégration (Date, Lieu...)' },
  { tag: '{details_embauche}', label: 'Détails du contrat (Type, Salaire)' },
  { tag: '{message_supp}', label: 'Message supplémentaire' },
];

const VARS_INVITATION = [
  { tag: '{prenom}', label: 'Prénom du candidat' },
  { tag: '{nom}', label: 'Nom' },
  { tag: '{poste}', label: 'Titre du poste' },
  { tag: '{date}', label: 'Date de l\'entretien' },
  { tag: '{heure}', label: 'Heure' },
  { tag: '{lieu}', label: 'Lieu / Lien' },
];

const TemplateBlock = ({ title, color, subjectKey, bodyKey, settings, updateSetting, variables }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm border-l-4 transition-colors ${color}`}
      >
        <span className="font-black uppercase tracking-tight">{title}</span>
        <span className="text-[10px] font-black">{open ? 'MOINS -' : 'PLUS +'}</span>
      </button>

      {open && (
        <div className="p-5 space-y-4 bg-white dark:bg-[#1a202c]">
          {/* Variables helper */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variables :</span>
            {variables.map(v => (
              <code
                key={v.tag}
                title={v.label}
                className="text-[11px] bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded cursor-pointer select-all"
              >
                {v.tag}
              </code>
            ))}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Objet (sujet)</label>
            <input
              type="text"
              value={settings[subjectKey] ?? ''}
              onChange={e => updateSetting(subjectKey, e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Objet de l'email..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
              Corps du message
            </label>
            <textarea
              rows={8}
              value={settings[bodyKey] ?? ''}
              onChange={e => updateSetting(bodyKey, e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Contenu de l'email..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Utilisez les variables ci-dessus pour personnaliser le message avec les données du candidat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const EmailSettings = ({ settings, updateSetting }) => {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <CardHeader title="Templates d'emails" colorClass="bg-violet-500" />
      <div className="p-5 sm:p-6 space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personnalisez les emails envoyés automatiquement aux candidats lors d'un <strong>refus</strong> ou d'un <strong>recrutement</strong> final.
        </p>



        <TemplateBlock
          title="Email de refus"
          color="border-rose-500 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:bg-[#1e293b] dark:text-rose-300 dark:hover:bg-[#334155]"
          subjectKey="emailRefuseSujet"
          bodyKey="emailRefuseCorps"
          settings={settings}
          updateSetting={updateSetting}
          variables={VARS_REFUS}
        />

        <TemplateBlock
          title="Email d'invitation à un entretien"
          color="border-blue-500 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-[#1e293b] dark:text-blue-300 dark:hover:bg-[#334155]"
          subjectKey="emailInvitationSujet"
          bodyKey="emailInvitationCorps"
          settings={settings}
          updateSetting={updateSetting}
          variables={VARS_INVITATION}
        />

        <TemplateBlock
          title="Email de recrutement (Intégration)"
          color="border-violet-500 bg-violet-50 text-violet-900 hover:bg-violet-100 dark:bg-[#1e293b] dark:text-violet-300 dark:hover:bg-[#334155]"
          subjectKey="emailRecruteSujet"
          bodyKey="emailRecruteCorps"
          settings={settings}
          updateSetting={updateSetting}
          variables={VARS_RECRUTEMENT}
        />
      </div>
    </div>
  );
};

export default EmailSettings;
