

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-center mb-8">
          <span className="text-6xl font-bold">
            <span className="text-green-600">Green</span> Island
          </span>
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="text-center mb-12">
            <p className="text-xl text-gray-600 mb-6">
              Analyzing and combating Urban Heat Islands in Patna through data-driven solutions
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Our Mission</h2>
              <p className="text-gray-600">
                We&apos;re dedicated to understanding and addressing the rising temperatures in Patna&apos;s urban areas. 
                Through satellite data analysis and ground-based measurements, we identify heat islands and propose 
                effective green solutions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Key Features</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Real-time temperature monitoring</li>
                <li>Vegetation density analysis</li>
                <li>Interactive heat maps</li>
                <li>Green intervention recommendations</li>
              </ul>
            </div>
          </section>

          <section className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Impact</h2>
            <p className="text-gray-600">
              Studies show a 6.88°C increase in Patna&apos;s surface temperature between 1990 and 2022. 
              Our platform helps visualize this change and suggests data-driven solutions for a cooler, 
              greener future.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
