// app.js
const { createApp, ref, computed } = Vue;

const calculateInsurancePrice = (phoneName) => {
    if (!phoneName) return 0;
    const phone = mobileData.find(m => m.name === phoneName);
    if (!phone) return 0;

    // Fallback if fullPrice is not defined
    const fullPrice = phone.fullPrice || (phone.price24 * 24);

    for (const tier of insuranceTiers) {
        if (fullPrice <= tier.maxPrice) {
            return tier.monthly;
        }
    }
    return 0;
};

createApp({
    setup() {
        const persons = ref([
            { id: Date.now(), planId: 'Sikre', phoneName: '', contractType: '24 mnd', hasInsurance: false, showAccessory: false, accessoryName: '', accessoryContractType: '24 mnd' }
        ]);

        const availablePhones = ref(mobileData.sort((a, b) => a.name.localeCompare(b.name)));
        const availableAccessories = ref(allAccessories.sort((a, b) => a.name.localeCompare(b.name)));
        const plans = ref(plansInfo);

        const addPerson = () => {
            persons.value.push({
                id: Date.now(),
                planId: 'Sikre',
                phoneName: '',
                contractType: '24 mnd',
                hasInsurance: false,
                showAccessory: false,
                accessoryName: '',
                accessoryContractType: '24 mnd'
            });
        };

        const removePerson = (id) => {
            if (persons.value.length > 1) {
                persons.value = persons.value.filter(p => p.id !== id);
            }
        };

        const toggleAccessory = (person) => {
            person.showAccessory = !person.showAccessory;
            if (!person.showAccessory) {
                person.accessoryName = '';
            }
        };

        // Regn ut abonnement for hver person slik at familierabatt regnes riktig
        const personPlanCosts = computed(() => {
            const costs = {};
            const sortedPersons = [...persons.value].sort((a, b) => {
                const planA = plans.value[a.planId];
                const planB = plans.value[b.planId];
                return (planB?.first || 0) - (planA?.first || 0);
            });

            let isFirstDone = false;
            sortedPersons.forEach((person) => {
                const plan = plans.value[person.planId];
                if (!plan) {
                    costs[person.id] = 0;
                    return;
                }

                if (!isFirstDone) {
                    costs[person.id] = plan.first;
                    isFirstDone = true;
                } else {
                    costs[person.id] = plan.subseq;
                }
            });
            return costs;
        });

        // Totalsum i kassa (En-gangs beløp for mobil + tilbehør)
        const totalUpfront = computed(() => {
            return persons.value.reduce((sum, person) => {
                let currentPersonSum = 0;

                if (person.phoneName && person.contractType === 'Fullpris') {
                    const phone = availablePhones.value.find(p => p.name === person.phoneName);
                    if (phone) {
                        currentPersonSum += (phone.fullPrice || (phone.price24 * 24));
                    }
                }

                if (person.showAccessory && person.accessoryName && person.accessoryContractType === 'Fullpris') {
                    const accessory = availableAccessories.value.find(a => a.name === person.accessoryName);
                    if (accessory) {
                        currentPersonSum += (accessory.fullPrice || 0);
                    }
                }

                return sum + currentPersonSum;
            }, 0);
        });

        // Totalsum per måned per person
        const personTotalMonthly = computed(() => {
            const result = {};
            persons.value.forEach(person => {
                let monthly = 0;

                // 1. Abonnement
                monthly += personPlanCosts.value[person.id] || 0;

                // 2. Mobil avbetaling
                if (person.phoneName && (person.contractType === '24 mnd' || person.contractType === '36 mnd')) {
                    const phone = availablePhones.value.find(p => p.name === person.phoneName);
                    if (phone) {
                        if (person.contractType === '24 mnd') monthly += phone.price24;
                        if (person.contractType === '36 mnd') monthly += phone.price36;
                    }
                }

                // 3. Forsikring
                if (person.phoneName && person.hasInsurance) {
                    monthly += calculateInsurancePrice(person.phoneName);
                }

                // 4. Tilbehør avbetaling
                if (person.showAccessory && person.accessoryName && (person.accessoryContractType === '24 mnd' || person.accessoryContractType === '36 mnd')) {
                    const accessory = availableAccessories.value.find(a => a.name === person.accessoryName);
                    if (accessory) {
                        if (person.accessoryContractType === '24 mnd') monthly += accessory.price24;
                        if (person.accessoryContractType === '36 mnd') monthly += accessory.price36;
                    }
                }

                result[person.id] = monthly;
            });
            return result;
        });

        // Sum av alle personers månedlige kostnader
        const grandTotalMonthly = computed(() => {
            return Object.values(personTotalMonthly.value).reduce((a, b) => a + b, 0);
        });

        return {
            persons,
            availablePhones,
            availableAccessories,
            plans,
            addPerson,
            removePerson,
            toggleAccessory,
            personPlanCosts,
            personTotalMonthly,
            totalUpfront,
            grandTotalMonthly,
            calculateInsurancePrice
        };
    }
}).mount('#app');
