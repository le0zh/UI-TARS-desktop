import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { SearchSettings, SearchProvider } from '@agent-infra/shared';
import { getSearchProviderLogo } from './searchUtils';
import toast from 'react-hot-toast';
import { ipcClient } from '@renderer/api';

interface SearchSettingsTabProps {
  settings: SearchSettings;
  setSettings: (settings: SearchSettings) => void;
}

interface TestSearchServiceProps {
  settings: SearchSettings;
}

function TestSearchService({ settings }: TestSearchServiceProps) {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Button
        color="primary"
        variant="flat"
        isLoading={isLoading}
        onClick={async () => {
          try {
            setIsLoading(true);
            const { success, message } =
              await ipcClient.testSearchService(settings);

            if (success) {
              toast.success('Search service is ready');
            } else {
              setErrorMessage(message);
              setIsErrorModalOpen(true);
            }
          } catch (error) {
            setErrorMessage(String(error));
            setIsErrorModalOpen(true);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        Test Search Service
      </Button>

      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-medium">Search Service Test Error</h3>
          </ModalHeader>
          <ModalBody>
            <div className="max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
                {errorMessage}
              </pre>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsErrorModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export function SearchSettingsTab({
  settings,
  setSettings,
}: SearchSettingsTabProps) {
  return (
    <div className="space-y-4 py-2">
      <Select
        label="Search Provider"
        selectedKeys={[settings.provider]}
        onChange={(e) => {
          setSettings({
            ...settings,
            provider: e.target.value as SearchProvider,
          });
        }}
        startContent={getSearchProviderLogo(settings.provider)}
      >
        <SelectItem
          key={SearchProvider.TAVILY}
          startContent={getSearchProviderLogo(SearchProvider.TAVILY)}
        >
          Tavily Search
        </SelectItem>
        {/* <SelectItem
          key={SearchProvider.BROWSER_SEARCH}
          startContent={getSearchProviderLogo(SearchProvider.BROWSER_SEARCH)}
        >
          Browser Search
        </SelectItem> */}
        <SelectItem
          key={SearchProvider.DUCKDUCKGO_SEARCH}
          startContent={getSearchProviderLogo(SearchProvider.DUCKDUCKGO_SEARCH)}
        >
          Duckduckgo Search
        </SelectItem>
        <SelectItem
          key={SearchProvider.BING_SEARCH}
          startContent={getSearchProviderLogo(SearchProvider.BING_SEARCH)}
        >
          Bing Search
        </SelectItem>
        <SelectItem
          key={SearchProvider.SEARXNG}
          startContent={getSearchProviderLogo(SearchProvider.SEARXNG)}
        >
          SearXNG Search
        </SelectItem>
      </Select>

      {[SearchProvider.TAVILY, SearchProvider.BING_SEARCH].includes(
        settings.provider,
      ) && (
        <Input
          type="password"
          label="API Key"
          placeholder="Enter your API key"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          isRequired
          description={
            settings.provider === SearchProvider.BING_SEARCH
              ? 'Your Bing Search API key'
              : 'Your Tavily API key'
          }
        />
      )}

      <Divider className="my-2" />
      {settings.provider === SearchProvider.BING_SEARCH ? (
        <p className="text-sm text-default-500">Advanced Settings (Optional)</p>
      ) : null}

      {/* {settings.provider === SearchProvider.BROWSER_SEARCH && (
        <Select
          label="Default Search Engine"
          placeholder="Select your default search engine"
          value={settings.defaultEngine || 'bing'}
          onChange={(e) =>
            setSettings({
              ...settings,
              defaultEngine: e.target.value as SearchSettings['defaultEngine'],
            })
          }
        >
          <SelectItem key="bing">Bing</SelectItem>
        </Select>
      )} */}

      {settings.provider === SearchProvider.BING_SEARCH && (
        <Input
          label="Custom Endpoint"
          placeholder="https://api.bing.microsoft.com/"
          value={settings.baseUrl || ''}
          onChange={(e) =>
            setSettings({ ...settings, baseUrl: e.target.value })
          }
          description="Override the default Bing Search API endpoint"
        />
      )}

      {settings.provider === SearchProvider.SEARXNG && (
        <Input
          label="Custom Endpoint"
          placeholder="https://127.0.0.1:8081/"
          value={settings.baseUrl || ''}
          onChange={(e) =>
            setSettings({ ...settings, baseUrl: e.target.value })
          }
          description="Override the default SearXNG API endpoint"
        />
      )}

      <TestSearchService settings={settings} />
    </div>
  );
}
