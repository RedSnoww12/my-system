import { Camera, ImageIcon } from 'lucide-react'

interface PhotoSourceSheetProps {
  onCamera: () => void
  onLibrary: () => void
  onCancel: () => void
}

export function PhotoSourceSheet({ onCamera, onLibrary, onCancel }: PhotoSourceSheetProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onCancel} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-800 rounded-t-3xl animate-slide-up max-w-lg mx-auto">
        <div className="w-10 h-1 bg-dark-600 rounded-full mx-auto mt-3" />

        <div className="p-5 space-y-3 pb-8">
          <p className="text-xs text-dark-500 text-center mb-4">Ajouter une photo du repas</p>

          <button
            onClick={onCamera}
            className="w-full flex items-center gap-4 bg-dark-700 rounded-2xl p-4 active:bg-dark-600 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Camera size={22} className="text-accent" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Prendre une photo</p>
              <p className="text-xs text-dark-500 mt-0.5">Ouvre l'appareil photo</p>
            </div>
          </button>

          <button
            onClick={onLibrary}
            className="w-full flex items-center gap-4 bg-dark-700 rounded-2xl p-4 active:bg-dark-600 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-dark-600 flex items-center justify-center flex-shrink-0">
              <ImageIcon size={22} className="text-dark-300" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Choisir depuis la bibliothèque</p>
              <p className="text-xs text-dark-500 mt-0.5">Sélectionne une photo existante</p>
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-3 text-sm text-dark-400 active:text-dark-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  )
}
