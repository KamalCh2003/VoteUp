// import GlassCard from '../common/GlassCard';
// import Button from '../common/Button';
// import { useToast } from '../../context/ToastContext';

// export default function PremiumPlans() {
//   const toast = useToast();

//   const plans = [
//     { name: 'Free', price: '$0', features: ['Basic voting'] },
//     { name: 'Pro', price: '$15/mo', features: ['Advanced analytics', 'Priority support'] },
//   ];

//   const handleSubscribe = (plan) => {
//     toast.success(`Subscribed to ${plan}`);
//   };

//   return (
//     <div className="mt-6">
//       <h2 className="text-lg font-semibold mb-4">Voter Plans</h2>
//       <div className="grid grid-cols-2 gap-4">
//         {plans.map(p => (
//           <GlassCard key={p.name}>
//             <h3 className="font-medium mb-2">{p.name}</h3>
//             <p className="text-xl font-bold">{p.price}</p>
//             <ul className="text-xs text-[var(--t2)] mt-2 mb-4 space-y-1">
//               {p.features.map(f => <li key={f}>✓ {f}</li>)}
//             </ul>
//             <Button variant="primary" className="w-full text-xs" onClick={() => handleSubscribe(p.name)}>Subscribe</Button>
//           </GlassCard>
//         ))}
//       </div>
//     </div>
//   );
// }