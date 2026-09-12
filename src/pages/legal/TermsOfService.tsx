import PageLayout from '../../components/layout/PageLayout';

export default function TermsOfService() {
    return (
        <PageLayout 
            title="Terms of Service" 
            subtitle="Please read these terms carefully before using our service."
        >
            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing and using Text2Handwriting (the "Service"), developed by Bipin Vishwakarma, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
                Permission is granted to use Text2Handwriting for personal, academic, and document creation purposes. You are granted full ownership of any handwritten assignments, lab notebooks, diagrams, and PDF exports produced using the platform:
            </p>
            <ul>
                <li>Modify or copy the open-source code in accordance with the project repository license.</li>
                <li>You may use your generated and exported documents freely for school, college, submissions, and creative projects.</li>
                <li>Do not employ automated scripts to abuse or degrade platform availability.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>
                The materials on Text2Handwriting's website are provided on an 'as is' basis. Text2Handwriting makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>

            <h3>4. Limitations</h3>
            <p>
                In no event shall Text2Handwriting or its contributors be liable for any damages arising out of the use or inability to use the platform.
            </p>

            <h3>5. Revisions & Updates</h3>
            <p>
                Text2Handwriting is continuously developed to provide students with the highest-fidelity handwriting simulations and lab tools. Features may be updated or refined over time.
            </p>

            <p className="text-sm text-neutral-400 mt-8">
                Last updated: January 29, 2026
            </p>
        </PageLayout>
    );
}
