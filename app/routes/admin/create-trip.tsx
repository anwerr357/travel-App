import { ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import { Header } from '~/components';
import type { Route } from './+types/create-trip';
import { comboBoxItems, selectItems } from '~/constants';
import { formatKey } from '~/lib/utils';

export const loader = async () => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,latlng');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('API Error:', data);
            return [];
        }
        return data.map((country: any) => ({
            name: country?.flag + " " + country?.name?.common,
            coordinates: country?.latlng,
            value: country?.name?.common,
        }));
    } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Return fallback data
        return [
            { name: '🇺🇸 United States', coordinates: [39.8283, -98.5795], value: 'United States' },
            { name: '🇬🇧 United Kingdom', coordinates: [55.3781, -3.4360], value: 'United Kingdom' },
            { name: '🇫🇷 France', coordinates: [46.6034, 1.8883], value: 'France' },
            { name: '🇩🇪 Germany', coordinates: [51.1657, 10.4515], value: 'Germany' },
            { name: '🇯🇵 Japan', coordinates: [36.2048, 138.2529], value: 'Japan' }
        ];
    }
}
const createTrip = ({ loaderData }: Route.ComponentProps) => {
    const countries = loaderData as Country[];
    const handleSubmit = async () => { };
    const contryData = countries.map((country) => ({
        text: country.name,
        value: country.value
    }));
    const handleChange = (key: keyof TripFormData, value: string | number) => {

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
                            placeholder='Enter a number of days'
                            className="form-input
                                placeholder:text-gray-100"
                            type='number'
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


                </form>
            </section>
        </main>
    )
}

export default createTrip;