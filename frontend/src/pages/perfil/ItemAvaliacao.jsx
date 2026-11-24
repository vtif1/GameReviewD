import { useState } from 'react';

function ItemAvaliacao(props) {
    const [estrelas, setEstrelas] = useState(props.estrelas);
    const [texto, setTexto] = useState(props.texto || '');

    return (
        <div className="mt-3 pt-3 border-top">

            <div className="row g-2 align-items-center">

                <div className="col-auto">

                    <select
                        id={`estrelas-${props.idJogo}`}
                        className="form-select form-select-sm"
                        value={estrelas}
                        onChange={(e) => setEstrelas(Number(e.target.value))}
                    >
                        <option value="1">★ 1</option>
                        <option value="2">★ 2</option>
                        <option value="3">★ 3</option>
                        <option value="4">★ 4</option>
                        <option value="5">★ 5</option>
                    </select>
                </div>

                <div className="col text-end">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => props.salvarEdicao(props.idJogo, texto, estrelas)}
                    >
                        Salvar alterações
                    </button>

                    <button onClick={() => props.apagaAvaliacao(props.idJogo)} className="btn border-0 rounded-2 px-2 py-1 bg-danger ms-1"><i className="bi bi-trash3"></i></button>
                </div>

                <div className="col-12">
                    <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Escreva sua avaliação"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default ItemAvaliacao;
