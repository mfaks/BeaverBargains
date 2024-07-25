import React from 'react'

interface UnauthorizedModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

const UnauthorizedModal: React.FC<UnauthorizedModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
        <h2 className="text-lg font-semibold text-red-600">Error</h2>
        <p className="mt-2">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default UnauthorizedModal
