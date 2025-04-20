import { useState } from 'react';
import './WhatsAppChat.css'; 

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChat = () => {
    const phoneNumber = '51948593198';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hola! deseo información para obtener mi usuario y contraseña para ingresar al módulo de Estudio para el Ascenso de Suboficiales de Armas`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Botón flotante */}
      <div 
        className="whatsapp-button" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/images/whatsapp-white.svg" alt="WhatsApp" />
      </div>

      {/* Diálogo del chat */}
      {isOpen && (
        <div className="whatsapp-dialog">
          <div className="whatsapp-header">
            <img className="iconWhatsapp" src="/images/whatsapp-white.svg" alt="WhatsApp" />
            <span className="text-whatsapp">WhatsApp</span>
            <span className="close-dialog" onClick={() => setIsOpen(false)}>x</span>
          </div>
          <div className="whatsapp-content">
            <p className="whatsapp-message">Hola! amigo PNP</p>
            <p className="whatsapp-message">¿Estudiando para tu ASCENSO?</p>
            <p className="whatsapp-message">Escribenos ...</p>
            <button className="openChatButton" onClick={handleOpenChat}>
              Abrir Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;