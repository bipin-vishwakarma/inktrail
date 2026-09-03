import PageLayout from '../components/layout/PageLayout';
import { Github, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    return (
        <PageLayout 
            title="Contact & Support" 
            subtitle="Get support, report issues, or suggest new handwriting features for PaperTrail."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 not-prose">
                <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm text-center">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Github size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">GitHub Issues</h3>
                    <p className="text-neutral-500 mb-6">Found a bug or have a feature request? Open an issue.</p>
                    <a href="https://github.com/bipin-vishwakarma/papertrail/issues" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                        Open GitHub Issue →
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm text-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Community & Feedback</h3>
                    <p className="text-neutral-500 mb-6">Join discussions and connect directly with the developer.</p>
                    <a href="https://github.com/bipin-vishwakarma/papertrail/discussions" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        GitHub Discussions →
                    </a>
                </div>
            </div>
            <h3>Frequently Asked Questions</h3>
            <p>
                Before reaching out, check our <a href="/faq">FAQ page</a> for answers to common questions about exports, fonts, and privacy.
            </p>
        </PageLayout>
    );
}
