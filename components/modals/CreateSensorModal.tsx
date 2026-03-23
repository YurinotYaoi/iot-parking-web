"use client"

import { useState } from "react"

type Props = {
  handleShowCSModal: () => void
}

const CreateSensorModal = ({handleShowCSModal} : Props) => {

  return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={handleShowCSModal}>
        <div className="bg-white/75 p-6 rounded w-[400px]"
        onClick={(e) => e.stopPropagation()}>
          Create Sensor WIP
        </div>
      </div>
  );
};

export default CreateSensorModal;