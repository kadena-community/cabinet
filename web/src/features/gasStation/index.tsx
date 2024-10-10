import React, { useState } from 'react';
import GasStationModal from './gasModal';
import GasStationIcon from '@/assets/images/gas-station-icon.svg';
import { useAppSelector } from "@/app/hooks";
import { selectGasStationEnabled } from './gasSlice';

const GasStation: React.FC = () => {
    const gasStationEnabled = useAppSelector(selectGasStationEnabled);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    const handleOpenGasModal = (event: React.MouseEvent) => {
        event.stopPropagation();
        setModalOpen(true);
    };

    const handleCloseGasModal = () => {
        setModalOpen(false);
    };

    return (
        <>
            <div
                className={`w-6 h-6 cursor-pointer mr-4 ${gasStationEnabled ? 'text-k-Green-default' : 'text-gray-500'}`}
                onClick={(e) => handleOpenGasModal(e)}
            >
                <GasStationIcon />
            </div>
            {isModalOpen && (
                <GasStationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseGasModal}
                />
            )}
        </>
    );
};

export default GasStation;
