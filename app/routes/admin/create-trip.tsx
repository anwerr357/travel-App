import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Header } from '~/components';
import type { Route } from './+types/create-trip';
import { comboBoxItems, selectItems } from '~/constants';
import { cn, formatKey } from '~/lib/utils';
import { LayerDirective, LayersDirective, MapsComponent } from '@syncfusion/ej2-react-maps';
import { useState } from 'react';
import { world_map } from '~/constants/world_map';
import { account } from '~/appwrite';

export const loader = async () => {
    
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,latlng');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.error('API Error - not an array:', data);
            return getFallbackCountries();
        }
        
        const countries = data.map((country: any) => ({
            name: country?.flag + " " + country?.name?.common,
            coordinates: country?.latlng,
            value: country?.name?.common,
        }));
        
        console.log('Successfully processed', countries.length, 'countries');
        return countries;
        
    } catch (error) {
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        
        return getFallbackCountries();
    }
}

function getFallbackCountries() {
    return [
        { name: '🇺🇸 United States', coordinates: [39.8283, -98.5795], value: 'United States' },
        { name: '🇬🇧 United Kingdom', coordinates: [55.3781, -3.4360], value: 'United Kingdom' },
        { name: '🇫🇷 France', coordinates: [46.6034, 1.8883], value: 'France' },
        { name: '🇩🇪 Germany', coordinates: [51.1657, 10.4515], value: 'Germany' },
        { name: '🇯🇵 Japan', coordinates: [36.2048, 138.2529], value: 'Japan' }
    ];
}
const createTrip = ({ loaderData }: Route.ComponentProps) => {
    const countries = loaderData as Country[];
    const [formatData, setFormData] = useState<TripFormData>({
        country: countries[0]?.value || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false); 
    const mapData = [
        {
            country: formatData.country,
            color: '#ea2e3e',
            coordinates: countries.find((c: Country) => c.name === formatData.country)?.coordinates
        }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Validation
        const missingFields = [];
        if (!formatData.country) missingFields.push('Country');
        if (!formatData.duration || formatData.duration <= 0 || formatData.duration > 15) missingFields.push('Duration (1-15 days)');
        if (!formatData.travelStyle) missingFields.push('Travel Style');
        if (!formatData.interest) missingFields.push('Interest');
        if (!formatData.budget) missingFields.push('Budget');
        if (!formatData.groupType) missingFields.push('Group Type');
            console.log('Form data: ',formatData);
        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            setLoading(false);
            return;
        }
        
        try {
            const user = await account.get();
            console.log('user: ',user);
                if(!user.$id){
                    console.error("User not logged in ");
                    return;
                }
            
            console.log('Form data:', formatData);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success handling
            console.log('Trip created successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create trip');
        } finally {
            setLoading(false);
        }
    };
    const contryData = countries.map((country) => ({
        text: country.name,
        value: country.value
    }));

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formatData, [key]: value })
    }


    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header
                title="Add a New Trip"
                description="View and edit AI-generated travel plans"
            />
            <section className='mt-2.5 wrapper-md'>
                <form className='trip-form' onSubmit={handleSubmit}>

                    <div>
                        <label htmlFor='country'>
                            Country
                        </label>
                        <ComboBoxComponent
                            id="country"
                            dataSource={contryData}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder='Select a Country'
                            className='combo-box'
                            change={(e: any) => {
                                if (e?.value) {
                                    handleChange('country', e.value);
                                }

                            }}
                            allowFiltering
                            filtering={(e) => {
                                const query = e.text.toLowerCase();
                                e.updateData(
                                    countries.filter(
                                        (country) => country.name.toLowerCase().includes(query)).map((country) => ({
                                            text: country.name,
                                            value: country.value
                                        }))
                                )

                            }}

                        />
                    </div>
                    <div>
                        <label htmlFor='duration'>Duration </label>
                        <input
                            id='duration'
                            name='duration'
                            placeholder='Enter a number of days (1-15)'
                            className="form-input
                                placeholder:text-gray-100"
                            type='number'
                            min="1"
                            max="15"
                            onChange={(e) => handleChange('duration', Number(e.target.value))}

                        />
                    </div>
                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>
                            <ComboBoxComponent
                                id={key}
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item
                                }))}
                                placeholder={`Seelct ${formatKey(key)}`}
                                change={(e: any) => {
                                    if (e?.value) {
                                        handleChange(key, e.value);
                                    }

                                }}
                                allowFiltering
                                filtering={(e) => {
                                    const query = e.text.toLowerCase();
                                    e.updateData(
                                        comboBoxItems[key].filter(
                                            (item) => item.toLowerCase().includes(query)).map((item) => ({
                                                text: item,
                                                value: item
                                            }))
                                    )

                                }}
                                className='combo-box'
                            />
                        </div>
                    ))}
                    <div>
                        <label htmlFor='location'>
                            Location on the world map
                        </label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapeDataPath='country'
                                    shapePropertyPath='name'
                                    shapeSettings={{
                                        colorValuePath: 'color', fill: '#e5e5e5'

                                    }}

                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>
                    <div className='bg-gray-200 h-px w-full'/>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                            <div className="flex">
                                <div className="text-red-800">
                                    <h3 className="text-sm font-medium">Error occurred</h3>
                                    <p className="mt-1 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <footer className="px-6 w-full">
                        <ButtonComponent
                            type="submit"
                            className='button-class !h-12 !w-full'
                            disabled={loading}
                        >
                            <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} className={cn('size-5', {'animate-spin':loading})} />
                            <span className='p-16-semibold text-white'  >
                                {loading ? 'Creating Trip...' : 'Create Trip'}
                            </span>
                        </ButtonComponent>
                    </footer>
                </form>
            </section>
        </main>
    )
}

export default createTrip;