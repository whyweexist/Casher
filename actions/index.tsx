import { OpenAI } from "openai";
import { createAI, getMutableAIState, render } from "ai/rsc";
import { z } from "zod";
import { GearApi } from '@gear-js/api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import TransferTokensCard from "@/components/transfer-token-card";
import {BeatLoader} from "react-spinners"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


function Spinner() {
    return <div>Loading...</div>;
}



function ChainInfoCard({ chainInfo }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Road 2  Devcon</CardTitle>
                <CardDescription className="">Web3’s highest-
                    performing layer-1 decentralized network.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                <p>{chainInfo.chainName}</p>
                <p>{chainInfo.nodeName}</p>
                <p>{chainInfo.nodeVersion}</p>
            </CardContent>
        </Card>
    );
}



type getChainInfoProps = {

}

async function getChainInfo({ }: getChainInfoProps) {
    const gearApi = await GearApi.create({
        providerAddress: 'wss://testnet.vara.network',
    });

    const [chain, nodeName, nodeVersion] = await Promise.all([
        gearApi.chain(),
        gearApi.nodeName(),
        gearApi.nodeVersion(),
    ]);
    console.log(
        `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`,
    );
    return {
        chainName: chain,
        nodeName: nodeName,
        nodeVersion: nodeVersion,
    };
}


function setTransferParams(receieverAddr:string,amount:number){
    return {receiverAddr:receieverAddr,amount:amount};
}



// @ts-ignore
async function submitUserMessage(userInput: string) {
    "use server";
    // @ts-ignore
    const aiState = getMutableAIState<typeof AI>();

    aiState.update([
        ...aiState.get(),
        {
            role: 'user',
            content: userInput
        }
    ]);

    // @ts-ignore
    const ui = render({
        model: 'gpt-4-0125-preview',
        provider: openai,
        messages: [
            { role: 'system', content: 'You are a very helpful ETH blockchain assistant your name is ETH/POLYGON wallet, how helps with users queries with eth blockchain and helps them to interact with the vara blockchain' },
            ...aiState.get()
        ],
        text: ({ content, done }) => {
            if (done) {
                aiState.done([
                    ...aiState.get(),
                    {
                        role: "assistant",
                        content
                    }
                ]);
            }
            return <p>{content}</p>
        },
        tools: {
            get_chain_info: {
                description: "Gets all the required information about the eth blockchain.",
                parameters: z.object({}),
                render: async function* ({ }) {
                    yield <Spinner />
                    const chainInfo = await getChainInfo({});
                    aiState.done([
                        aiState.get(),
                        {
                            role: "function",
                            name: "get_chain_info",
                            content: JSON.stringify(chainInfo),
                        }
                    ])
                    return <ChainInfoCard chainInfo={chainInfo} />
                }
            },
            transfer_tokens: {
                description: "Transfer tokens to any wallet address.",
                parameters: z.object({
                    receiverAddr: z.string(),
                    amount: z.number()
                }),
                render: async function* ({ receiverAddr, amount }) {
                    yield <Spinner />
                    const params=setTransferParams(receiverAddr,amount);
                    aiState.done([
                        aiState.get(),
                        {
                            role: "function",
                            name: "transfer_tokens",
                            content: JSON.stringify(params),
                        }
                    ])
                    return <TransferTokensCard params={params}/>
                }
            },
        }
    })

    return {
        id: Date.now(),
        display: ui,
    }

}

// Define the initial state of the AI. It can be any JSON object.
const initialAIState: {
    role: 'user' | 'assistant' | 'system' | 'function';
    content: string;
    id?: string;
    name?: string;
}[] = [];

// The initial UI state that the client will keep track of, which contains the message IDs and their UI nodes.
const initialUIState: {
    id: number;
    display: React.ReactNode;
}[] = [];

// @ts-ignore
export const AI = createAI({
    actions: {
        submitUserMessage
    },
    // Each state can be any shape of object, but for chat applications
    // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
    initialUIState,
    initialAIState
});
