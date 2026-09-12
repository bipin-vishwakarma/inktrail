import PageLayout from '../../components/layout/PageLayout';

export default function Disclaimer() {
    return (
        <PageLayout 
            title="Disclaimer & Academic Guidelines" 
            subtitle="Understanding the educational purpose, realistic simulation, and ethical use of Text2Handwriting."
        >
            <h3>1. General Disclaimer</h3>
            <p>
                The tools and services provided by <strong>Text2Handwriting</strong> ("we," "us", or "our"), created by Bipin Vishwakarma, are provided for educational, productivity, and document presentation purposes. All features on the application are offered in good faith; however, we make no representations or warranties of any kind, express or implied, regarding commercial suitability or specific legal enforceability in all administrative domains.
            </p>

            <h3>2. Educational Simulation & Student Lab Notebooks</h3>
            <p>
                Text2Handwriting is engineered specifically to help university and school students format, preview, and print study material, homework drafts, and laboratory practical notebooks (interleaved diagram and ruled observation sheets). It reduces repetitive strain injury (RSI) while providing high-quality digital layout for assignments.
            </p>

            <h3>3. Academic Integrity & Responsible Use</h3>
            <p>
                We firmly advocate for academic honesty and ethical learning practices. Text2Handwriting is intended as an assistive study and formatting utility. It should never be employed for academic fraud, examination deception, impersonation, or submitting unoriginal work where individual handwritten production is strictly monitored and required under honor codes. Students remain exclusively responsible for ensuring compliance with their respective academic institution's code of conduct.
            </p>

            <h3>4. Not a Legal Wet-Ink Substitute</h3>
            <p>
                Digital handwriting produced by algorithmic rendering engines is a synthetic visual representation. It is not an authorized legal substitute for handwritten wet-ink signatures on formal legal instruments, testamentary documents, government certificates, or sworn affidavits unless explicitly recognized by local statutory frameworks.
            </p>

            <h3>5. Privacy & Zero-Retention Security</h3>
            <p>
                All text rendering, AI cleaning, and PDF exports are processed client-side within your browser. Text2Handwriting does not sell, harvest, or transmit your assignments or document content to external servers.
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: 2026 • Text2Handwriting by Bipin Vishwakarma
            </p>
        </PageLayout>
    );
}
