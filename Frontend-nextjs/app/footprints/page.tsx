import Image from "next/image";

const footprints = () => {
  return (  
    <div>
        <div className="container mx-auto p-8">
            <div className="mb-8"></div>
            <h2 className="text-xl font-semibold mb-2">Patna City Urban Heat Map</h2>
            <p className="text-md mb-4">
            Urban heat maps highlight the rising temperatures in cities due to factors like reduced vegetation and increased urbanization. Below are some key indicators for Patna City:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 shadow-md">
                <Image
                src="/patna_lst.png"
                alt="Land Surface Temperature"
                width={500}
                height={300}
                className="w-full h-auto rounded-md mb-2"
                />
                <h3 className="text-lg font-medium">Land Surface Temperature</h3>
                <p className="text-sm">
                Rising land surface temperatures contribute to urban heat islands, impacting the environment and public health.
                </p>
            </div>
            <div className="border rounded-lg p-4 shadow-md">
                <Image
                src="/ndvi.png"
                alt="NDVI"
                width={500}
                height={300}
                className="w-full h-auto rounded-md mb-2"
                />
                <h3 className="text-lg font-medium">NDVI (Normalized Difference Vegetation Index)</h3>
                <p className="text-sm">
                NDVI measures vegetation health. Reduced vegetation in urban areas exacerbates heat retention.
                </p>
            </div>
            <div className="border rounded-lg p-4 shadow-md">
                <Image
                src="/emissivity.png"
                alt="Emissivity"
                width={500}
                height={300}
                className="w-full h-auto rounded-md mb-2"
                />
                <h3 className="text-lg font-medium">Emissivity</h3>
                <p className="text-sm">
                Emissivity indicates the efficiency of surfaces emitting heat. Urban materials often have higher emissivity.
                </p>
            </div>
            <div className="border rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-medium">Harmful Effects</h3>
                <ul className="list-disc list-inside text-sm">
                <li>Increased energy consumption for cooling.</li>
                <li>Higher air pollution and greenhouse gas emissions.</li>
                <li>Adverse health effects, especially for vulnerable populations.</li>
                <li>Reduced water quality due to thermal pollution.</li>
                </ul>
            </div>
            </div>
        </div>
        <div>
            <h1 className="text-2xl font-bold mb-4">Footprints</h1>
            <p className="text-lg mb-4">This is the Footprints page.</p>
            <p className="text-lg mb-4">You can add your content here.</p>
            <p className="text-lg mb-4">Feel free to customize it as needed.</p>
        </div>
        </div>
  );
}

export default footprints;
