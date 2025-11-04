import { useRef, useState } from 'react'
import { useTranslation } from '@/components/context/TranslationContext'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Autocomplete } from '@react-google-maps/api'
import { extractAddressComponents } from '@/utils/helperFunction'
import Map from '@/components/google-maps/GoogleMap'
import axios from 'axios'


const LocationComponent = ({
    selectedLocationAddress,
    setSelectedLocationAddress,
    apiKey,
    handleLocationSelect,
    handleCheckRequiredFields,
    isEditing = false,
    isProperty = true
}) => {
    const t = useTranslation();
    const autocompleteRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [thanaSuggestions, setThanaSuggestions] = useState([]); // for thanas
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [thanaDropdownOpen, setThanaDropdownOpen] = useState(false);
    const [thanaSearchText, setThanaSearchText] = useState('');

    const handleCityPlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry && place.geometry.location) {
                try {
                    const location = place.geometry.location;

                    // Extract address components
                    const addressData = extractAddressComponents(place);

                    // Update the form with city and state from the selected place
                    setSelectedLocationAddress(prev => ({
                        ...prev,
                        city: addressData.city || '',
                        state: addressData.state || '',
                        latitude: location.lat ? location.lat() : prev.latitude,
                        longitude: location.lng ? location.lng() : prev.longitude,
                        country: addressData.country || prev.country,
                        formattedAddress: addressData.formattedAddress || prev.formattedAddress
                    }));
                } catch (error) {
                    console.error("Error processing place data:", error);
                }
            }
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className='font-medium text-gray-800'>{isProperty ? t("selectPropertyLocationNote") : t("selectProjectLocationNote")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* City */}
                    {/* <div className='flex w-full gap-3'>
                        <div className="w-1/2">
                            <Label htmlFor="city" className="font-medium text-gray-800">
                                {t("city")} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Autocomplete
                                    onLoad={ref => autocompleteRef.current = ref}
                                    onPlaceChanged={handleCityPlaceSelect}
                                    types={['(cities)']}
                                >
                                    <Input
                                        type="text"
                                        id="city"
                                        value={selectedLocationAddress.city || ''}
                                        onChange={(e) => setSelectedLocationAddress(prev => ({ ...prev, city: e.target.value }))}
                                        placeholder={t("searchCity")}
                                        className="w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent pr-10"
                                    />
                                </Autocomplete>
                            </div>
                        </div>
                        <div className="w-1/2">
                            <Label htmlFor="state" className="font-medium text-gray-800">
                                {t("state")} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                id="state"
                                value={selectedLocationAddress.state || ''}
                                onChange={(e) => setSelectedLocationAddress(prev => ({ ...prev, state: e.target.value }))}
                                placeholder={t("enterState")}
                                className="w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent"
                            />
                        </div>
                    </div> */}
                    <div className='flex w-full gap-3'>
                        {/* District Dropdown - replaces City */}
                        <div className="w-1/2 relative">
                            <Label htmlFor="city" className="font-medium text-gray-800">
                                Districts <span className="text-red-500">*</span>
                            </Label>

                            <div className="relative">
                                <div
                                    className="w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent flex items-center cursor-pointer"
                                    onClick={async () => {
                                        if (suggestions.length === 0) {
                                            try {
                                                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/districts`);
                                                const districts = res.data.map((d) => d.district);
                                                setSuggestions(districts);
                                            } catch (err) {
                                                console.error(err);
                                                setSuggestions([]);
                                            }
                                        }
                                        setDropdownOpen((prev) => !prev);
                                    }}
                                >
                                    <span className="flex-1 truncate">
                                        {selectedLocationAddress.city || 'Select District'}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-md max-h-56 overflow-auto">
                                        {/* Search Box */}
                                        <div className="p-2">
                                            <input
                                                type="text"
                                                placeholder="Search district..."
                                                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                        </div>

                                        <ul>
                                            {suggestions
                                                .filter((district) =>
                                                    district.toLowerCase().includes(searchText.toLowerCase())
                                                )
                                                .map((district) => (
                                                    <li
                                                        key={district}
                                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                                        onClick={() => {
                                                            setSelectedLocationAddress(prev => ({ ...prev, city: district }));
                                                            setSelectedDistrict(district);
                                                            setThanaSuggestions([]);
                                                            setDropdownOpen(false);
                                                        }}
                                                    >
                                                        {district}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thana Dropdown - replaces State */}
                        <div className="w-1/2 relative">
                            <Label htmlFor="state" className="font-medium text-gray-800">
                                Thana <span className="text-red-500">*</span>
                            </Label>

                            <div
                                className={`w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent flex items-center ${!selectedDistrict ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                onClick={async () => {
                                    if (!selectedDistrict) return;
                                    if (thanaSuggestions.length === 0) {
                                        try {
                                            const res = await axios.get(
                                                `${process.env.NEXT_PUBLIC_API_URL}/api/thanas/${encodeURIComponent(selectedDistrict)}`
                                            );
                                            const thanas = res.data.map((t) => t.thana);
                                            setThanaSuggestions(thanas);
                                        } catch (err) {
                                            console.error(err);
                                            setThanaSuggestions([]);
                                        }
                                    }
                                    setThanaDropdownOpen((prev) => !prev);
                                }}
                            >
                                <span className="flex-1 truncate">
                                    {selectedLocationAddress.state
                                        ? selectedLocationAddress.state
                                        : selectedDistrict
                                            ? `Enter Thana of ${selectedDistrict}`
                                            : 'Select District first'}
                                </span>

                                <svg
                                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${thanaDropdownOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {thanaDropdownOpen && selectedDistrict && (
                                <div className="absolute z-10 w-full bg-white border rounded-md mt-1 shadow-md max-h-56 overflow-auto">
                                    <div className="p-2">
                                        <input
                                            type="text"
                                            placeholder="Search thana..."
                                            className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
                                            value={thanaSearchText}
                                            onChange={(e) => setThanaSearchText(e.target.value)}
                                        />
                                    </div>

                                    <ul>
                                        {thanaSuggestions
                                            .filter((thana) =>
                                                thana.toLowerCase().includes(thanaSearchText.toLowerCase())
                                            )
                                            .map((thana) => (
                                                <li
                                                    key={thana}
                                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                                    onClick={() => {
                                                        setSelectedLocationAddress(prev => ({ ...prev, state: thana }));
                                                        setThanaDropdownOpen(false);
                                                    }}
                                                >
                                                    {thana}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Country */}
                     {/*<div>
                        <Label htmlFor="country" className="font-medium text-gray-800">
                            {t("country")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="country"
                            value={selectedLocationAddress.country || ''}
                            onChange={(e) => setSelectedLocationAddress(prev => ({ ...prev, country: e.target.value }))}
                            placeholder={t("enterCountry")}
                            className="w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent"
                        />
                    </div>*/}

                    {/* Address */}
                    <div>
                        <Label htmlFor="address" className="font-medium text-gray-800">
                            {t("address")} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="address"
                                value={selectedLocationAddress.formattedAddress || ''}
                                onChange={(e) => setSelectedLocationAddress(prev => ({ ...prev, formattedAddress: e.target.value }))}
                                placeholder={t("enterFullAddress")}
                                className="w-full px-3 py-2 primaryBackgroundBg rounded-md focus:outline-none focus:border-none focus:border-transparent resize-none h-24"
                            />
                        </div>
                    </div>
                </div>

                 {/*<div className="w-full h-[350px] rounded-lg overflow-hidden">
                    <Map
                        latitude={selectedLocationAddress.latitude || 0}
                        longitude={selectedLocationAddress.longitude || 0}
                        showLabel={true}
                        apiKey={apiKey}
                        onSelectLocation={handleLocationSelect}
                    />
                </div>*/}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => handleCheckRequiredFields("location", isProperty ? "imagesVideo" : "floorDetails")}
                    className="px-10 py-5"
                >
                    {isEditing ? t("save") : t("next")}
                </Button>
            </div>
        </div>
    );
};

export default LocationComponent