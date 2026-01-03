function Footer() {
  return (
    <footer className="footer footer-center p-4 bg-base-200 text-base-content mt-10">
      <aside>
        <p>© {new Date().getFullYear()} CycleAway — All rights reserved</p>
        <p className="text-sm">
          <a className="link" href="/contact">
            Contact Us
          </a>{' '}
          |{' '}
          <a className="link" href="/faq">
            FAQ
          </a>
        </p>
      </aside>
    </footer>
  );
}

export default Footer;
