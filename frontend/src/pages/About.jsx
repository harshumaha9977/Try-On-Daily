import { Code, Server, Zap, Heart, Sparkles } from 'lucide-react';

const About = () => {
  const stack = [
    { name: 'React', icon: Code, desc: 'Interactive frontend architecture' },
    { name: 'Tailwind CSS', icon: Zap, desc: 'Utility-first modern styling' },
    { name: 'Python Backend', icon: Server, desc: 'Robust API handling' },
    { name: 'AI Models', icon: Sparkles, desc: 'State-of-the-art virtual try-on' },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            About Try-ON <span className="text-blue-600">daily</span>
          </h1>
          <p className="text-xl text-foreground/60">
            Bridging the gap between digital convenience and physical fitting rooms.
          </p>
        </div>

        <div className="prose prose-lg mx-auto mb-20 text-foreground/70">
          <p className="leading-relaxed">
            Try-ON daily was built with a simple mission: to revolutionize online shopping by eliminating the guesswork. We've all experienced the disappointment of ordering an item online, only to find it doesn't look quite right when it arrives.
          </p>
          <p className="leading-relaxed mt-4">
            By leveraging advanced artificial intelligence and computer vision models, our platform allows you to see how clothing will drape, fit, and look on your specific body type—instantly. No more ordering multiple sizes. No more returning items that didn't match your expectations.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            Powered by Modern Technology
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stack.map((tech) => (
              <div key={tech.name} className="flex items-start p-6 bg-card rounded-2xl border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <tech.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-foreground">{tech.name}</h3>
                  <p className="mt-1 text-foreground/60">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center p-8 bg-blue-50 rounded-3xl border border-blue-100">
          <Heart className="w-10 h-10 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">Built with Passion</h3>
          <p className="text-foreground/60">
            Designed to push the boundaries of what's possible on the web.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
