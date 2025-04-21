import React, { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaDiscord, FaEnvelope, FaHeart } from "react-icons/fa";

const Footer = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/system-contacts/v1");
        if (!response.ok) {
          throw new Error("Failed to fetch contact information");
        }
        const data = await response.json();
        setContacts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Function to render appropriate icon based on contact name
  const renderIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'facebook':
        return <FaFacebook className="social-icon" />;
      case 'instagram':
        return <FaInstagram className="social-icon" />;
      case 'discord':
        return <FaDiscord className="social-icon" />;
      case 'email':
        return <FaEnvelope className="social-icon" />;
      default:
        return null;
    }
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Contact Information */}
        <div className="footer-column">
          <h4 className="footer-heading">Thông tin liên hệ</h4>
          <div className="social-icons">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading contacts</p>
            ) : (
              contacts.map((contact) => (
                <a
                  key={contact.id}
                  href={contact.description}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={contact.name}
                  className="icon-link"
                >
                  {renderIcon(contact.name)}
                </a>
              ))
            )}
          </div>
          <p className="contact-info">
            Email: petalakapetservice@gmail.com<br />
            Hotline: 1900 1234
          </p>
        </div>

        {/* Policies */}
        <div className="footer-column">
          <h4 className="footer-heading">Chính sách</h4>
          <ul className="footer-list">
            <li className="footer-list-item">
              <a href="#" className="footer-link">Chính sách bảo mật</a>
            </li>
            <li className="footer-list-item">
              <a href="#" className="footer-link">Chính sách hoàn tiền</a>
            </li>
            <li className="footer-list-item">
              <a href="#" className="footer-link">Điều khoản dịch vụ</a>
            </li>
            <li className="footer-list-item">
              <a href="#" className="footer-link">Chính sách cookie</a>
            </li>
          </ul>
        </div>

        {/* About PoemTown */}
        <div className="footer-column">
          <h4 className="footer-heading">Về PoemTown</h4>
          <p className="footer-text">
            PoemTown là cộng đồng thơ ca trực tuyến, nơi kết nối những người yêu thơ và sáng tác thơ.
          </p>
        </div>

        {/* About Us */}
        <div className="footer-column">
          <h4 className="footer-heading">Về chúng tôi</h4>
          <p className="footer-text">
            Đội ngũ phát triển PoemTown với sứ mệnh mang thơ ca đến gần hơn với mọi người.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          &copy; {new Date().getFullYear()} PoemTown. Made with <FaHeart className="heart-icon" /> in Vietnam
        </p>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .footer-container {
          background: linear-gradient(135deg, #1a1a40 0%, #2a2a5e 100%);
          color: #fff;
          padding: 50px 20px 20px;
          position: relative;
          overflow: hidden;
        }

        .footer-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45aaf2);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          padding-bottom: 30px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-size: 1.2rem;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
          font-weight: 600;
        }

        .footer-heading::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 2px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
        }

        .social-icons {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .icon-link {
          color: #fff;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .social-icon {
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .icon-link:hover .social-icon {
          transform: translateY(-3px);
          color: #45aaf2;
        }

        .contact-info {
          line-height: 1.6;
          opacity: 0.8;
          font-size: 0.95rem;
        }

        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-list-item {
          transition: transform 0.3s ease;
        }

        .footer-list-item:hover {
          transform: translateX(5px);
        }

        .footer-link {
          color: #fff;
          opacity: 0.8;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .footer-link:hover {
          opacity: 1;
          color: #4ecdc4;
        }

        .footer-text {
          line-height: 1.6;
          opacity: 0.8;
          font-size: 0.95rem;
          margin: 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          text-align: center;
          margin-top: 30px;
        }

        .copyright {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .heart-icon {
          color: #ff6b6b;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 30px 20px;
          }

          .footer-heading {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            grid-template-columns: 1fr;
          }

          .footer-column {
            align-items: center;
            text-align: center;
          }

          .footer-heading::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .social-icons {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;