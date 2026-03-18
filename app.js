// app.js
const { createApp, ref, computed } = Vue;

const calculateInsurancePrice = (phoneName) => {
    if (!phoneName) return 0;
    const phone = mobileData.find(m => m.name === phoneName);
    if (!phone) return 0;

    for (const tier of insuranceTiers) {
        if (phone.fullPrice <= tier.maxPrice) {
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

        const totalUpfront = computed(() => {
            const total = persons.value.reduce((sum, person) => {
                let currentPersonSum = 0;

                if (person.phoneName && person.contractType === 'Fullpris') {
                    const phone = availablePhones.value.find(p => p.name === person.phoneName);
                    if (phone) currentPersonSum += phone.fullPrice;
                }

                if (person.showAccessory && person.accessoryName && person.accessoryContractType === 'Fullpris') {
                    const accessory = availableAccessories.value.find(a => a.name === person.accessoryName);
                    if (accessory) currentPersonSum += accessory.fullPrice;
                }

                return sum + currentPersonSum;
            }, 0);
            return Math.round(total * 100) / 100;
        });

        const personTotalMonthly = computed(() => {
            const result = {};
            persons.value.forEach(person => {
                let monthly = 0;

                monthly += personPlanCosts.value[person.id] || 0;

                if (person.phoneName && (person.contractType === '24 mnd' || person.contractType === '36 mnd')) {
                    const phone = availablePhones.value.find(p => p.name === person.phoneName);
                    if (phone) {
                        const months = person.contractType === '24 mnd' ? 24 : 36;
                        monthly += getMonthlyPrice(phone.fullPrice, months);
                    }
                }

                if (person.phoneName && person.hasInsurance) {
                    monthly += calculateInsurancePrice(person.phoneName);
                }

                if (person.showAccessory && person.accessoryName && (person.accessoryContractType === '24 mnd' || person.accessoryContractType === '36 mnd')) {
                    const accessory = availableAccessories.value.find(a => a.name === person.accessoryName);
                    if (accessory && !accessory.noInstallment) {
                        const months = person.accessoryContractType === '24 mnd' ? 24 : 36;
                        monthly += getMonthlyPrice(accessory.fullPrice, months);
                    }
                }

                result[person.id] = Math.round(monthly * 100) / 100;
            });
            return result;
        });

        const grandTotalMonthly = computed(() => {
            const total = Object.values(personTotalMonthly.value).reduce((a, b) => a + b, 0);
            return Math.round(total * 100) / 100;
        });

        const getItemPrice = (itemName, contractType, list) => {
            if (!itemName) return null;
            const item = list.find(i => i.name === itemName);
            if (!item) return null;

            if (contractType === 'Fullpris') {
                return { amount: item.fullPrice, type: 'upfront' };
            }
            if (contractType === 'Ingen avtale / Kjøpt tidligere') {
                return null;
            }
            if (item.noInstallment) {
                return { amount: item.fullPrice, type: 'upfront-only' };
            }
            const months = contractType === '24 mnd' ? 24 : 36;
            return { amount: getMonthlyPrice(item.fullPrice, months), type: 'monthly', fullPrice: item.fullPrice };
        };

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
            calculateInsurancePrice,
            getItemPrice
        };
    }
}).mount('#app');
