import { useState } from 'react';
import './IngredientesList.css';

interface IngredientesListProps {
    ingredientes: string[];
}

export default function IngredientesList({ ingredientes }: IngredientesListProps) {
    const [marcados, setMarcados] = useState<boolean[]>(
        new Array(ingredientes.length).fill(false)
    );

    const toggleMarcar = (index: number) => {
        const nuevosMarcados = [...marcados];
        nuevosMarcados[index] = !nuevosMarcados[index];
        setMarcados(nuevosMarcados);
    };

    return (
        <ul className="ingredientes-lista">
            {ingredientes.map((ing, idx) => (
                <li 
                    key={idx} 
                    className="ingrediente-item"
                    onClick={() => toggleMarcar(idx)}
                >
                    <input 
                        type="checkbox" 
                        className="ingrediente-checkbox"
                        checked={marcados[idx]}
                        readOnly
                    />
                    <span className={`ingrediente-texto ${marcados[idx] ? 'completado' : ''}`}>
                        {ing}
                    </span>
                </li>
            ))}
        </ul>
    );
}