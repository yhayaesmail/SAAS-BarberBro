import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-km">KM</span>
          <span className="brand-barber">BARBER</span>
        </div>
        <p className="footer-text">Premium barber appointment booking platform</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} KM-BARBER. All rights reserved.</p>
      </div>
    </footer>
  );
}
